package repository

import (
	"errors"
	"log"

	"gorm.io/gorm"

	"music_system/model"
	"music_system/tool/filter"
)

type GroupRepository struct {
	db *gorm.DB
}

func NewGroupRepository(db *gorm.DB) *GroupRepository {
	return &GroupRepository{
		db: db,
	}
}

func (repo *GroupRepository) CreateGroup(group *model.Group) error {
	query := repo.db.Model(&model.Group{})
	err := query.Create(group).Error
	if err != nil {
		log.Println("repo: 添加group错误: ", err)
		return errors.New("内部错误")
	}
	return nil
}

func (repo *GroupRepository) FindGroup(condition *filter.FindGroup) (error, *model.Group) {
	var data model.Group

	query := repo.db.Model(&model.Group{})
	// condition
	if len(condition.ID) > 0 {
		query = query.Where("id = ?", condition.ID)
	}
	if len(condition.Name) > 0 {
		query = query.Where("name = ?", condition.Name)
	}
	if len(condition.MusicIDs) > 0 {
		for _, id := range condition.MusicIDs {
			// 既然您喜欢“纯天然”的模式，这里使用最原始的 LIKE 查询
			// 我们在 content 这个 JSON 字符串里查找是否包含指定的音乐 ID
			// 加上双引号是为了精确匹配，防止 id="1" 匹配到 id="10"
			query = query.Where("content LIKE ?", "%\""+id+"\"%")
		}
	}

	err := query.First(&data).Error
	if err != nil {
		log.Println("repo: find group错误: ", err)
		return errors.New("内部错误"), nil
	}

	return nil, &data
}

func (repo *GroupRepository) ListGroup(condition *filter.ListGroup) (error, []*model.Group, int64) {
	var data []*model.Group
	var total int64

	query := repo.db.Model(&model.Group{})

	// condition
	if len(condition.Name) > 0 {
		query = query.Where("name LIKE ?", "%"+condition.Name+"%")
	}

	query = query.Order("create_time DESC")
	if !condition.StartTime.IsZero() && !condition.EndTime.IsZero() {
		query = query.Where("create_time BETWEEN ? AND ?", condition.StartTime, condition.EndTime)
	}
	query = query.Limit(condition.Size).Offset(condition.Page)
	query = query.Count(&total)

	err := query.Find(&data).Error
	if err != nil {
		log.Println("repo: list group错误: ", err)
		return errors.New("内部错误"), nil, 0
	}

	return nil, data, total
}

func (repo *GroupRepository) UpdateGroup(group *model.Group) error {
	query := repo.db.Model(&model.Group{})

	err := query.Where("id = ?", group.ID).Updates(group).Error
	if err != nil {
		log.Println("repo: update group错误: ", err)
		return errors.New("内部错误")
	}

	return nil
}

func (repo *GroupRepository) DeleteGroup(group *model.Group) error {
	query := repo.db.Model(&model.Group{})

	err := query.Delete(group).Error
	if err != nil {
		log.Println("repo: delete group错误: ", err)
		return errors.New("内部错误")
	}
	return nil
}
