package repo

import (
	"music_system/model"
	"music_system/tool/filter"
)

type ICommentRepository interface {
	CreateComment(comment *model.Comment) error

	FindComment(findComment filter.FindComment) (error, []*model.Comment)
	FindCommentsWithPagination(findComment filter.FindCommentWithPagination) (error, []*model.Comment, int64)

	UpdateComment(comment *model.Comment) error
	DeleteComment(deleteFilter filter.DeleteComment) error
}
