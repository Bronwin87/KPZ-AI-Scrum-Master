import { Injectable, inject, signal } from '@angular/core';
import { EstimationPokerDataService } from './estimation-poker-data.service';
import { SessionTask } from '../models/session-task';
import { AuthorizationService } from '../../authorization/services/authorization-service';
import { TaskEstimation } from '../models/task-estimation';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EstimationPokerService {
  private readonly dataService = inject(EstimationPokerDataService);
  private readonly authorizationService = inject(AuthorizationService);

  public showScrumMasterView = this.authorizationService.isAuthorized;

  #taskEstimations = signal<TaskEstimation[]>([]);
  public taskEstimations = this.#taskEstimations.asReadonly();

  #averageTaskEstimation = signal<number>(0);
  public averageTaskEstimation = this.#averageTaskEstimation.asReadonly();

  #sessionTask = signal<SessionTask | null>(null);
  public sessionTask = this.#sessionTask.asReadonly();

  private readonly newTaskLoadedSubject$ = new Subject<void>();
  public newTaskLoaded$ = this.newTaskLoadedSubject$.asObservable(); 

  public clearTaskEstimations() {
    this.#taskEstimations.set([]);
    this.#averageTaskEstimation.set(0);
  }

  public loadTaskEstimations(taskId: number) {
    this.dataService.getSessionTaskEstimations(taskId).subscribe({
      next: (response) => {
        this.#taskEstimations.set(response.estimations);
        this.#averageTaskEstimation.set(response.averageEstimation);
      },
    });
  }

  public loadSessionTask(sessionId: string) {
    this.dataService.getSessionTask(sessionId).subscribe((task) => {
      this.#sessionTask.update(oldTask => {
        if (JSON.stringify(oldTask) !== JSON.stringify(task)) {
          this.newTaskLoadedSubject$.next();
        }
        return task;
      });
    });
  }
}