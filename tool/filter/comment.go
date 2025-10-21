package filter

type FindComment struct {
	ID      string
	MusicID string
	UserID  string

	StartTime int64
	EndTime   int64
}

type FindCommentWithPagination struct {
	ID      []string
	MusicID []string
	UserID  []string

	StartTime int64
	EndTime   int64

	Limit  int
	Offset int
}

//type UpdateComment struct {
//	ID string
//}

type DeleteComment struct {
	ID string
}
