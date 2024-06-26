import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectFeedComponent } from './components/project-feed/project-feed.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { SprintPreviewComponent } from './components/sprint-preview/sprint-preview.component';
import { SprintStatsComponent } from '../sprint-stats/sprint-stats.component';
import { SprintDataService } from '../sprints/services/sprint-data.service';
import { ToastService } from '../../shared/services/toast.service';
import { Sprint } from '../sprints/models/sprint';
import { EstimationPokerButtonComponent } from './components/estimation-poker-button/estimation-poker-button.component';

@Component({
  selector: 'app-project',
  standalone: true,
  templateUrl: './project.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ProjectFeedComponent,
    TranslateModule,
    SprintPreviewComponent,
    SprintStatsComponent,
    EstimationPokerButtonComponent,
  ],
})
export class ProjectComponent implements OnInit {
  private readonly translateService = inject(TranslateService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly sprintPreviewDataService = inject(SprintDataService);
  private readonly toastService = inject(ToastService);

  #sprints = signal<Sprint[]>([]);
  public readonly sprints = this.#sprints.asReadonly();

  #projectId = signal<number>(0);
  public projectId = this.#projectId.asReadonly();

  readonly topSprintIdNotSet = -1;
  public topSprintId = computed(() => {
    return this.sprints()[0]?.sprintId ?? this.topSprintIdNotSet;
  });

  public ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const projectId = params['projectId'];
      this.#projectId.set(projectId);

      this.loadSprintPreviews(projectId);
    });
  }

  private loadSprintPreviews(projectId: number): void {
    this.sprintPreviewDataService.getSprints(projectId).subscribe({
      next: (sprints) => {
        this.#sprints.set(sprints);
      },
      error: () =>
        this.toastService.openError(
          this.translateService.instant('Project.SprintPreview.Error')
        ),
    });
  }
}
