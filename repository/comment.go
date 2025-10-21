package repository

import (
	"errors"
	"log"
	"time"

	"gorm.io/gorm"

	"music_system/model"
	"music_system/tool/filter"
)

type CommentRepository struct {
	db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{
		db: db,
	}
}

func (repo *CommentRepository) CreateComment(comment *model.Comment) error {
	query := repo.db.Model(comment)
	err := query.Create(comment).Error
	if err != nil {
		log.Printf("error: %v", err)
		return errors.New("内部错误")
	}

	return nil
}

func (repo *CommentRepository) FindComment(findComment filter.FindComment) (error, []*model.Comment) {
	var data []*model.Comment
	query := repo.db.Model(&model.Comment{})

	if len(findComment.ID) > 0 {
		query = query.Where("id = ?", findComment.ID)
	}
	if len(findComment.UserID) > 0 {
		query = query.Where("user_id = ?", findComment.UserID)
	}
	if len(findComment.MusicID) > 0 {
		query = query.Where("music_id = ?", findComment.MusicID)
	}

	// todo 时间的检验方法还要再看
	if findComment.EndTime > 0 && findComment.StartTime > 0 {
		query = query.Where("create_time BETWEEN ? AND ?", time.UnixMilli(findComment.StartTime), time.UnixMilli(findComment.EndTime))
	}

	err := query.Find(&data).Error
	if err != nil {
		log.Printf("err: %v", err)
		return errors.New("内部错误"), nil
	}
	if len(data) == 0 {
		return gorm.ErrRecordNotFound, nil // 或自定义 "未找到"
	}

	return nil, data
}

func (repo *CommentRepository) FindCommentsWithPagination(findComment filter.FindCommentWithPagination) (error, []*model.Comment, int64) {
	var data []*model.Comment
	var total int64
	query := repo.db.Model(&model.Comment{})

	// Apply filters
	if len(findComment.ID) > 0 {
		query = query.Where("id IN ?", findComment.ID)
	}
	if len(findComment.UserID) > 0 {
		query = query.Where("user_id IN ?", findComment.UserID)
	}
	if len(findComment.MusicID) > 0 {
		query = query.Where("music_id IN ?", findComment.MusicID)
	}

	if findComment.EndTime > 0 && findComment.StartTime > 0 {
		query = query.Where("create_time BETWEEN ? AND ?", time.UnixMilli(findComment.StartTime), time.UnixMilli(findComment.EndTime))
	}

	// Count total before pagination
	err := query.Count(&total).Error
	if err != nil {
		log.Printf("err: %v", err)
		return errors.New("内部错误"), nil, 0
	}

	// Apply pagination
	if findComment.Limit > 0 {
		query = query.Limit(findComment.Limit)
	}
	if findComment.Offset > 0 {
		query = query.Offset(findComment.Offset)
	}

	err = query.Find(&data).Error
	if err != nil {
		log.Printf("err: %v", err)
		return errors.New("内部错误"), nil, 0
	}

	return nil, data, total
}

func (repo *CommentRepository) UpdateComment(comment *model.Comment) error {
	if comment == nil {
		log.Println("error: 空指针comment")
		return errors.New("空指针 comment")
	}
	if len(comment.ID) == 0 {
		log.Println("更新失败：必须提供 ID")
		return errors.New("更新失败：必须提供 ID")
	}

	query := repo.db.Model(comment)
	query = query.Where("id = ?", comment.ID)

	err := query.Updates(comment).Error
	if err != nil {
		log.Println("error: 更新comment错误")
		return errors.New("内部错误")
	}

	return nil
}

func (repo *CommentRepository) DeleteComment(deleteFilter filter.DeleteComment) error {
	if len(deleteFilter.ID) == 0 {
		log.Println("删除失败：必须提供有效的 ID")
		return errors.New("删除失败：必须提供有效的 ID")
	}

	query := repo.db.Model(&model.Comment{})
	query = query.Where("id = ?", deleteFilter.ID)

	err := query.Delete(&model.Comment{}).Error
	if err != nil {
		log.Println("err: 删除comment错误")
		return errors.New("内部错误")
	}

	// 可选：记录日志，如果没删除任何记录
	if query.RowsAffected == 0 {
		// 不返回 error，但可以 log 一下
		log.Printf("警告: 未找到 ID 为 %s 的 Comment 记录", deleteFilter.ID)
		// 如果业务需要严格模式，这里可以返回 errors.New("未找到匹配的 Comment 记录")
	}

	return nil
}
