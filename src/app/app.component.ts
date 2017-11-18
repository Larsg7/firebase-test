import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Idea {
  id: string;
  name: string;
  idea: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private ideaColl: AngularFirestoreCollection<Idea>;
  ideas: Observable<Idea[]>;

  name: string;

  formGroup: FormGroup;

  constructor(private db: AngularFirestore, private formBuilder: FormBuilder) {
    this.ideaColl = db.collection<Idea>('Ideas', ref => {
      return ref;
    });
    this.ideas = this.ideaColl.valueChanges();
    this.buildForm();
  }

  private buildForm(idea?: Idea) {
    this.formGroup = this.formBuilder.group({
      id: [idea ? idea.id : ''],
      name: [idea ? idea.name : '', Validators.required],
      idea: [idea ? idea.idea : '']
    });
  }

  ngOnInit() {
  }

  save() {
    if (this.formGroup.invalid) return;

    const idea: Idea = {
      id: this.formGroup.get('id').value,
      name: this.formGroup.get('name').value,
      idea: this.formGroup.get('idea').value,
    };

    if (idea.id) {
      this.getDocById(idea.id)
        .then(res => {
          res.forEach(doc => doc.ref.update(idea));
          this.formGroup.reset();
        });
      return;
    }

    this.ideaColl.add({
      id: this.db.createId(),
      name: idea.name,
      idea: idea.idea,
    }).then(() => {
      this.formGroup.reset();
    });
  }

  update(idea: Idea) {
    if (!idea) return;

    this.buildForm(idea);
  }

  deleteIdea(idea: Idea) {
    if (!idea) return;
    this.getDocById(idea.id)
      .then(res => {
        res.forEach(doc => doc.ref.delete());
      });
  }

  private getDocById(id: string) {
    return this.ideaColl.ref.where('id', '==', id).get();
  }
}
