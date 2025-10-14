package repository

import (
	gorm "gorm.io/gorm"

	"music_system/config"
	"music_system/model"
)

type BaseRepository struct {
	DB *gorm.DB
}

func NewBaseRepository() *BaseRepository {
	return &BaseRepository{
		DB: config.DB,
	}
}

// Create creates a new record in the database.
func (r *BaseRepository) Create(baseModel *model.BaseModel) error {
	return r.DB.Create(baseModel).Error
}
