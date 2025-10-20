package repository

import "gorm.io/gorm"

type UserActionPropertiesRepository struct {
	db *gorm.DB
}

func NewUserActionProperties(db *gorm.DB) *UserActionPropertiesRepository {
	return &UserActionPropertiesRepository{
		db: db,
	}
}
