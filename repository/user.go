package repository

import (
	"errors"
	"fmt"

	"gorm.io/gorm"

	"music_system/model"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (repo *UserRepository) Create(user *model.User) error {
	err := repo.db.Create(user).Error
	if err != nil {
		fmt.Println("err: ", err.Error())
		return errors.New("内部错误")
	}
	return nil
}

func (repo *UserRepository) Find(user *model.User) (error, *model.User) {
	var data model.User
	query := repo.db.Model(&model.User{})

	if len(user.ID) > 0 {
		query = query.Where("id = ?", user.ID)
	}
	if len(user.Username) > 0 {
		query = query.Where("username = ?", user.Username)
	}

	err := query.First(&data).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		fmt.Println("error: ", err.Error())
		return errors.New("内部错误"), nil
	}
	return nil, &data
}

func (repo *UserRepository) Update(user *model.User) error {
	err := repo.db.Model(user).Where("id = ?", user.ID).Updates(user).Error
	if err != nil {
		fmt.Println("error: update user 失败", err)
		return errors.New("内部错误")
	}
	return nil
}

func (repo *UserRepository) Delete(user *model.User) error {
	err := repo.db.Model(user).Where("id = ?", user.ID).Delete(user).Error
	if err != nil {
		fmt.Println("error: delete user 失败", err)
		return errors.New("内部错误")
	}
	return nil
}
