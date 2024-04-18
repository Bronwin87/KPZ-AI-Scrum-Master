import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, timer } from 'rxjs';
import { EstimationPokerService } from '../../services/estimation-poker.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EstimationPokerDataService } from '../../services/estimation-poker-data.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { MaterialModule } from '../../../../shared/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SessionTaskComponent } from "../session-task/session-task.component";

@Component({
    selector: 'app-developer-view',
    standalone: true,
    templateUrl: './developer-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MaterialModule, TranslateModule, ReactiveFormsModule, SessionTaskComponent]
})
export class DeveloperViewComponent {
  private readonly estimationPokerDataService = inject(EstimationPokerDataService);
  private readonly estimationPokerService = inject(EstimationPokerService);
  private readonly toastService = inject(ToastService);
  private readonly translationService = inject(TranslateService);

  public sessionId = input.required<string>();
  public currentTask = this.estimationPokerService.sessionTask;
  public username = signal<string>('');
  public usernameControl = new FormControl<string>('');
  public estimationValues = signal<number[]>([1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]);
  #disableEstiamtionButtons = signal<boolean>(false);
  public disableEstimationButtons = this.#disableEstiamtionButtons.asReadonly();

  private readonly minUsernameLength = 3;

  constructor() {
    timer(0, 5000)
      .pipe(
        takeUntilDestroyed(),
        map(() => this.estimationPokerService.loadSessionTask(this.sessionId()))
      )
      .subscribe();

    this.estimationPokerService.newTaskLoaded$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.#disableEstiamtionButtons.set(false);
    });

    this.usernameControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (value && value?.length >= this.minUsernameLength) {
          this.username.set(value);
        } else {
          this.username.set('');
        }
      });
  }

  public estimateCurrentTask(value: number) {
    const task = this.currentTask();
    if (!task){
      this.toastService.openError(this.translationService.instant("EstimationPoker.NoTasks"));
      return;
    }

    if (!this.username()){
      this.toastService.openError(this.translationService.instant("EstimationPoker.UserNameNotSelected"));
      return;
    }

    this.estimationPokerDataService.addTaskEstimation(
      task.id,
      this.username(),
      this.sessionId(),
      value
    ).subscribe({
      next: () => {
        this.estimationPokerService.loadSessionTask(this.sessionId());
        this.#disableEstiamtionButtons.set(true);
      },
    });
  }
}
