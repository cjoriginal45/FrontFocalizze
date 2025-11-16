import { Component, computed, effect, inject, OnInit, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { switchMap, tap } from 'rxjs';

import { Header } from '../../components/header/header';
import { Thread } from '../../components/thread/thread';
import { Comments } from '../../components/comments/comments';
import { FollowButton } from '../../components/follow-button/follow-button/follow-button';
import { Category } from '../../services/category/category';
import { ThreadState } from '../../services/thread-state/thread-state';
import { CategoryState } from '../../services/category-state/category-state';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { CategoryDetailsInterface } from '../../interfaces/CategoryDetailsInterface';
import { CategoryInterface } from '../../interfaces/CategoryInterface';

interface CategoryPageState {
  category: CategoryDetailsInterface | null;
  threadIds: number[];
  isLoading: boolean;
  allThreadsLoaded: boolean;
}

@Component({
  selector: 'app-category-page',
  imports: [CommonModule, MatIconModule, MatButtonModule, Header, Thread, FollowButton],
  templateUrl: './category-page.html',
  styleUrl: './category-page.css',
})
export class CategoryPage implements OnInit {
  private route = inject(ActivatedRoute);
  private categoryService = inject(Category);
  private threadStateService = inject(ThreadState);
  private categoryStateService = inject(CategoryState);
  private dialog = inject(MatDialog);

  private state = signal<CategoryPageState>({
    category: null,
    threadIds: [],
    isLoading: true,
    allThreadsLoaded: false,
  });

  public category = computed(() => this.state().category);
  public threadIds = computed(() => this.state().threadIds);
  public isLoading = computed(() => this.state().isLoading);

  private currentPage = 0;
  private readonly pageSize = 10;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.state.set({
            category: null,
            threadIds: [],
            isLoading: true,
            allThreadsLoaded: false,
          });
          this.currentPage = 0;
        }),
        switchMap((params) => {
          const categoryName = params.get('name');
          if (!categoryName) throw new Error('Nombre de categoría no encontrado');

          return this.categoryService.getCategoryDetails(categoryName);
        }),
        switchMap((categoryDetails) => {
          this.state.update((s) => ({ ...s, category: categoryDetails }));

          const categoryForState: CategoryInterface = {
            id: categoryDetails.id,
            name: categoryDetails.name,
            description: categoryDetails.description,
            followerCount: categoryDetails.followersCount,
            isFollowedByCurrentUser: categoryDetails.isFollowing,
          };
          this.categoryStateService.loadCategories([categoryForState]);

          return this.categoryService.getThreadsForCategory(
            categoryDetails.name,
            this.currentPage,
            this.pageSize
          );
        })
      )
      .subscribe({
        next: (threadPage) => {
          const newThreads: FeedThreadDto[] = threadPage.content;
          this.threadStateService.loadThreads(newThreads);

          this.state.update((s) => ({
            ...s,
            threadIds: newThreads.map((t) => t.id),
            isLoading: false,
            allThreadsLoaded: threadPage.last,
          }));
        },
        error: (err) => {
          console.error('Error al cargar la página de categoría', err);
          this.state.update((s) => ({ ...s, isLoading: false }));
        },
      });
  }

  onFollowChange(isNowFollowing: boolean): void {
    this.state.update((currentState) => {
      if (!currentState.category) return currentState;
      const newFollowersCount = currentState.category.followersCount + (isNowFollowing ? 1 : -1);
      return {
        ...currentState,
        category: {
          ...currentState.category,
          followersCount: newFollowersCount,
          isFollowing: isNowFollowing,
        },
      };
    });
  }

  openCommentsModal(threadId: number): void {
    this.dialog.open(Comments, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { threadId: threadId },
      panelClass: 'comments-dialog-container',
    });
  }
}
