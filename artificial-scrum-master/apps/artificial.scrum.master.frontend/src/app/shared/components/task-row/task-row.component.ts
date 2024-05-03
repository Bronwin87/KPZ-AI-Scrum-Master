import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskRow } from './task-row';
import { AvatarComponent } from '../avatar/avatar.component';
import { MaterialModule } from '../../material.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskDetailsComponent } from '../task-details/task-details.component';

@Component({
  selector: 'app-task-row',
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
    MaterialModule,
    TranslateModule,
    MaterialModule,
  ],
  templateUrl: './task-row.component.html',
})
export class TaskRowComponent {
  @Input()
  public taskRow: TaskRow;

  #dialog = inject(MatDialog);

  public openDetails(): void {
    this.#dialog.open(TaskDetailsComponent, {
      data: this.taskRow.taskId,
    });
  }
}
