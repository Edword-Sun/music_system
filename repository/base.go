package repository

import (
	"context"
	"fmt"
	"gorm.io/gorm"
)

// BaseRepository defines common CRUD operations using generics.
type BaseRepository[T any] interface {
	Create(ctx context.Context, entity *T) error
	Update(ctx context.Context, entity *T) error
	Delete(ctx context.Context, id string) error
	FindByID(ctx context.Context, id string) (*T, error)
	List(ctx context.Context, offset, limit int, order string) ([]T, int64, error)
}

type baseRepository[T any] struct {
	db *gorm.DB
}

func NewBaseRepository[T any](db *gorm.DB) BaseRepository[T] {
	return &baseRepository[T]{db: db}
}

func (r *baseRepository[T]) Create(ctx context.Context, entity *T) error {
	if err := r.db.WithContext(ctx).Create(entity).Error; err != nil {
		return fmt.Errorf("failed to create entity: %w", err)
	}
	return nil
}

func (r *baseRepository[T]) Update(ctx context.Context, entity *T) error {
	if err := r.db.WithContext(ctx).Save(entity).Error; err != nil {
		return fmt.Errorf("failed to update entity: %w", err)
	}
	return nil
}

func (r *baseRepository[T]) Delete(ctx context.Context, id string) error {
	var entity T
	if err := r.db.WithContext(ctx).Where("id = ?", id).Delete(&entity).Error; err != nil {
		return fmt.Errorf("failed to delete entity: %w", err)
	}
	return nil
}

func (r *baseRepository[T]) FindByID(ctx context.Context, id string) (*T, error) {
	var entity T
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&entity).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find entity: %w", err)
	}
	return &entity, nil
}

func (r *baseRepository[T]) List(ctx context.Context, offset, limit int, order string) ([]T, int64, error) {
	var entities []T
	var total int64

	db := r.db.WithContext(ctx).Model(&entities)
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count entities: %w", err)
	}

	if order != "" {
		db = db.Order(order)
	}

	if err := db.Offset(offset).Limit(limit).Find(&entities).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list entities: %w", err)
	}

	return entities, total, nil
}
