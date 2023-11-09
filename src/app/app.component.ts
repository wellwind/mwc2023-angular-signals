import {
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { switchMap } from 'rxjs';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatCheckboxModule],
  template: `
    <!-- todo list -->
    <table mat-table [dataSource]="todoItems()">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef>ID</th>
        <td mat-cell *matCellDef="let element">{{ element.id }}</td>
      </ng-container>
      <ng-container matColumnDef="title">
        <th mat-header-cell *matHeaderCellDef>Title</th>
        <td mat-cell *matCellDef="let element">{{ element.title }}</td>
      </ng-container>
      <ng-container matColumnDef="completed">
        <th mat-header-cell *matHeaderCellDef>Completed</th>
        <td mat-cell *matCellDef="let element">
          <mat-checkbox [checked]="element.completed" disabled></mat-checkbox>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="['id', 'title', 'completed']"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: ['id', 'title', 'completed']"
      ></tr>
    </table>

    <!-- pagination -->
    <section class="pagination">
      <button
        mat-raised-button
        (click)="goPage(1)"
        [disabled]="pageNumber() === 1"
      >
        First Page
      </button>

      <button
        mat-raised-button
        (click)="prevPage()"
        [disabled]="!canGoPrevPage()"
      >
        Prev Page
      </button>

      <div class="current-page">{{ pageNumber() }} / {{ pageSize() }}</div>

      <button
        mat-raised-button
        (click)="nextPage()"
        [disabled]="!canGoNextPage()"
      >
        Next Page
      </button>

      <button
        mat-raised-button
        (click)="goPage(pageSize())"
        [disabled]="pageNumber() === pageSize()"
      >
        Last Page
      </button>
    </section>
  `,
  styles: `
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;

    .current-page {
      margin: 0 10px;
      min-width: 75px;
      text-align: center;
    }

    .mdc-button--raised {
      margin: 0 5px;
    }
  }
  `,
})
export class AppComponent implements OnDestroy {
  private todoService = inject(TodoService);

  protected pageNumber = signal(1);

  private pageNumber$ = toObservable(this.pageNumber);

  private todoResponse$ = this.pageNumber$.pipe(
    switchMap((pageNumber) => this.todoService.getTodo(pageNumber))
  );

  private todoResponse = toSignal(this.todoResponse$, {
    initialValue: { data: [], total: 0, pageNumber: 0, pageSize: 0 },
  });

  protected todoItems = computed(() => this.todoResponse().data);
  protected total = computed(() => this.todoResponse().total);
  protected pageSize = computed(() => this.todoResponse().pageSize);
  protected canGoPrevPage = computed(() => this.pageNumber() > 1);
  protected canGoNextPage = computed(
    () => this.pageNumber() * this.pageSize() < this.total()
  );

  private logTodoResponse = effect(() => {
    console.log(this.todoResponse());
  });

  ngOnDestroy(): void {
    this.logTodoResponse.destroy();
  }

  prevPage() {
    if (this.canGoPrevPage()) {
      this.pageNumber.update((page) => page - 1);
    }
  }

  nextPage() {
    if (this.canGoNextPage()) {
      this.pageNumber.update((page) => page + 1);
    }
  }

  goPage(pageNumber: number): void {
    this.pageNumber.set(pageNumber);
  }
}
