package repository

import (
	"errors"
	"fmt"

	"gorm.io/gorm"

	"music_system/model"
)

type MusicRepository struct {
	db *gorm.DB
}

func NewMusicRepository(db *gorm.DB) *MusicRepository {
	return &MusicRepository{
		db: db,
	}
}

func (repo *MusicRepository) Create(md *model.Music) error {
	query := repo.db.Model(md)
	err := query.Create(md).Error
	if err != nil {
		fmt.Println("err: ", err.Error())
		return errors.New("内部错误")
	}
	return nil
}

// Find finds a record based on provided fields.
func (repo *MusicRepository) Find(music *model.Music) (error, *model.Music) {
	var data model.Music
	query := repo.db.Model(music)
	//hasCondition := false
	if len(music.ID) > 0 {
		query = query.Where("id = ?", music.ID)
		//hasCondition = true
	}
	if len(music.Title) > 0 {
		query = query.Where("title = ?", music.Title)
		//hasCondition = true
	}
	if len(music.SingerName) > 0 {
		query = query.Where("singer_name = ?", music.SingerName)
		//hasCondition = true
	}

	//if !hasCondition {
	//	return errors.New("no search criteria provided"), nil
	//}

	err := query.First(&data).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Record not found, return no error and nil music
		}
		fmt.Println("error: ", err.Error())
		return errors.New("内部错误"), nil
	}
	return nil, &data
}

// Update updates a record.
func (repo *MusicRepository) Update(music *model.Music) error {
	query := repo.db.Model(music)
	err := query.Where("id = ?", music.ID).Updates(music).Error
	if err != nil {
		fmt.Println("error: update music 失败", err)
		return errors.New("内部错误")
	}
	return nil
}

// Delete deletes a record.
func (repo *MusicRepository) Delete(music *model.Music) error {
	query := repo.db.Model(music)
	err := query.Where("id = ?", music.ID).Delete(music).Error
	if err != nil {
		fmt.Println("error: delete music 失败", err)
		return errors.New("内部错误")
	}
	return nil
}
