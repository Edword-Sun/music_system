package repository

import (
	"errors"
	"fmt"
	"log"

	"gorm.io/gorm"

	"music_system/model"
	"music_system/tool/filter"
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
func (repo *UserRepository) Find(condition *filter.FindUser) (error, *model.User) {
	var data model.User
	query := repo.db.Model(&model.User{}).Order("create_time DESC")
	if len(condition.ID) > 0 {
		query = query.Where("id = ?", condition.ID)
	}
	if len(condition.Name) > 0 {
		query = query.Where("name = ?", condition.Name)
	}
	if len(condition.Account) > 0 {
		query = query.Where("account = ?", condition.Account)
	}
	if len(condition.Email) > 0 {
		query = query.Where("email = ?", condition.Email)
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

func (repo *UserRepository) List(condition filter.ListUser) ([]*model.User, int64, error) {
	var data []*model.User
	var total int64

	query := repo.db.Model(&model.User{}).Order("create_time DESC")

	if len(condition.IDs) > 0 {
		query = query.Where("id IN ?", condition.IDs)
	}
	if len(condition.Names) > 0 {
		query = query.Where("name IN ?", condition.Names)
	}
	if len(condition.Accounts) > 0 {
		query = query.Where("account IN ?", condition.Accounts)
	}
	if len(condition.Passwords) > 0 {
		query = query.Where("password IN ?", condition.Passwords)
	}
	if len(condition.Emails) > 0 {
		query = query.Where("email IN ?", condition.Emails)
	}

	query = query.Where("create_time BETWEEN ? AND ?", condition.StartTime, condition.EndTime)

	err := query.Count(&total).Error
	if err != nil {
		log.Println("err: ", err)
		return nil, 0, errors.New("内部错误")
	}

	err = query.Offset(condition.Offset).Limit(condition.Limit).Find(&data).Error
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
