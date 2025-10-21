package repository

import "gorm.io/gorm"

type MusicHistoryRepository struct {
	db *gorm.DB
}

func NewMusicHistoryRepository(db *gorm.DB) *MusicHistoryRepository {
	return &MusicHistoryRepository{
		db: db,
	}
}
