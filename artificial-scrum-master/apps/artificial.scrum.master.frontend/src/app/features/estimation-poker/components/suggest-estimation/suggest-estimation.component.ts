import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstimationPokerDataService } from '../../services/estimation-poker-data.service';
import { MaterialModule } from '../../../../shared/material.module';
import { GetSuggestedEstimationResponse } from '../../models/get-suggested-estimation-response';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-suggest-estimation',
  standalone: true,
  imports: [CommonModule, MaterialModule, TranslateModule],
  templateUrl: './suggest-estimation.component.html',
})
export class SuggestEstimationComponent {
  private readonly dataService = inject(EstimationPokerDataService);

  public taskId = input.required<number>();
  public teamEstimations = input.required<number[]>();

  #estimationResult = signal<GetSuggestedEstimationResponse | null>(null);
  public estimationResult = this.#estimationResult.asReadonly();

  public reason = computed(() => this.estimationResult()?.reason ?? '');
  public estimation = computed(() => this.estimationResult()?.estimation ?? 0);

  public suggestEstimation() {
    this.dataService
      .getSuggestedEstimation(this.taskId(), this.teamEstimations())
      .subscribe({
        next: (response) => this.#estimationResult.set(response),
      });
  }
}
