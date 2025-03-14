package web

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/dilithaw123/broccoli-backend/internal/group"
)

func (s *Server) handleGetUserGroups() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		email := r.PathValue("email")
		groups, err := s.groupService.GetGroupsByEmail(r.Context(), strings.ToLower(email))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if err := json.NewEncoder(w).Encode(groups); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	}
}

func (s *Server) handlePostGroup() http.HandlerFunc {
	type request group.Group
	return func(w http.ResponseWriter, r *http.Request) {
		var req request
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		for ind, email := range req.AllowedEmails {
			req.AllowedEmails[ind] = strings.ToLower(email)
		}
		if err := s.groupService.CreateGroup(r.Context(), group.Group(req)); err != nil {
			switch err {
			case group.ErrGroupExists:
				http.Error(w, err.Error(), http.StatusBadRequest)
			default:
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
			return
		}
		w.WriteHeader(201)
	}
}

func (s *Server) handleAddUserToGroup() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		type request struct {
			UserEmail string `json:"email"`
			GroupID   uint64 `json:"group_id"`
		}
		var req request
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		email := r.Context().Value("email").(string)
		userAllowed, err := s.groupService.GroupContainsUser(
			r.Context(),
			req.GroupID,
			email,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if !userAllowed {
			http.Error(w, "user not allowed", http.StatusForbidden)
			return
		}

		err = s.groupService.AddUserToGroup(
			r.Context(),
			req.GroupID,
			strings.ToLower(req.UserEmail),
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}

func (s *Server) handleDeleteGroup() http.HandlerFunc {
	type request struct {
		GroupId   uint64 `json:"group_id"`
		UserEmail string `json:"user_email"`
	}
	return func(w http.ResponseWriter, r *http.Request) {
		var req request
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Bad request body", http.StatusBadRequest)
			return
		}
		req.UserEmail = strings.ToLower(req.UserEmail)
		if err := s.groupService.DeleteGroup(r.Context(), req.GroupId, req.UserEmail); err != nil {
			switch err {
			case group.ErrGroupNotFound:
				http.Error(w, "Group not found", http.StatusNotFound)
			case group.ErrUserNotPermitted:
				http.Error(w, "User not permitted", http.StatusForbidden)
			default:
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}
