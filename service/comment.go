package service

import (
	"errors"
	"log"

	"gorm.io/gorm"

	"music_system/model"
	"music_system/repository"
	"music_system/tool/filter"
)

type CommentService struct {
	commentRepo *repository.CommentRepository
}

func NewCommentService(commentRepo *repository.CommentRepository) *CommentService {
	return &CommentService{
		commentRepo: commentRepo,
	}
}

func (svc *CommentService) CreateComment(comment *model.Comment) error {
	err := svc.commentRepo.CreateComment(comment)
	if err != nil {
		log.Println("err: ", err.Error())
		return err
	}

	return nil
}

func (svc *CommentService) FindComment(commentFilter filter.FindComment) (error, []*model.Comment) {
	err, data := svc.commentRepo.FindComment(commentFilter)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Println("err: ", err.Error())
		return err, nil
	}

	return nil, data
}

func (svc *CommentService) ListComment(condition filter.FindCommentWithPagination) (error, []*model.Comment, int64) {
	err, data, total := svc.commentRepo.FindCommentsWithPagination(condition)
	if err != nil {
		log.Println("list comment 错误")
		log.Println("err: ", err)
		return err, nil, 0
	}

	return nil, data, total
}

func (svc *CommentService) UpdateComment(comment *model.Comment) error {
	err := svc.commentRepo.UpdateComment(comment)
	if err != nil {
		log.Println("err: ", err.Error())
		return err
	}

	return nil
}

func (svc *CommentService) DeleteComment(commentFilter filter.DeleteComment) error {
	err := svc.commentRepo.DeleteComment(commentFilter)
	if err != nil {
		log.Println("err: ", err)
		return err
	}
	return nil
}
