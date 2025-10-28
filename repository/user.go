package repository

import (
	"errors"
	"fmt"
	"gorm.io/gorm"
	"log"

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

// Create creates a new record in the database.
func (repo *UserRepository) Create(user *model.User) error {
	query := repo.db.Model(user)
	err := query.Create(user).Error
	if err != nil {
		fmt.Println("error: create user 失败")
		return errors.New("内部错误")
	}
	return nil
}

// find
func (repo *UserRepository) Find(user *model.User) (error, *model.User) {
	var data model.User
	query := repo.db.Model(&model.User{})
	if len(user.ID) > 0 {
		query = query.Where("id = ?", user.ID)
	}
	if len(user.Name) > 0 {
		query = query.Where("name = ?", user.Name)
	}
	if len(user.Account) > 0 {
		query = query.Where("account = ?", user.Account)
	}
	if len(user.Email) > 0 {
		query = query.Where("email = ?", user.Email)
	}

	err := query.First(&data).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Record not found, return no error and nil user
		}
		fmt.Println("error: ", err.Error())
		return errors.New("内部错误"), nil
	}
	return nil, &data
}

func (repo *UserRepository) List(offset, size int) ([]*model.User, int64, error) {
	var data []*model.User
	var total int64

	query := repo.db.Model(&model.User{})

	err := query.Find(data).Count(&total).Error
	if err != nil {
		log.Println("err: ", err)
		return nil, 0, errors.New("内部错误")
	}

	err = query.Offset(offset).Limit(size).Find(&data).Error
	if err != nil {
		log.Println("err", err)
		return nil, 0, errors.New("内部错误")
	}

	return data, total, nil
}

// update
func (repo *UserRepository) Update(user *model.User) error {
	query := repo.db.Model(user)
	err := query.Where("id = ?", user.ID).Updates(user).Error
	if err != nil {
		fmt.Println("error: update user 失败", err)
		return errors.New("内部错误")
	}
	return nil
}

// delete
func (repo *UserRepository) Delete(user *model.User) error {
	query := repo.db.Model(&model.User{})
	err := query.Where("id = ?", user.ID).Delete(user).Error
	if err != nil {
		fmt.Println("error: delete user 失败", err)
		return errors.New("内部错误")
	}
	return nil
}
