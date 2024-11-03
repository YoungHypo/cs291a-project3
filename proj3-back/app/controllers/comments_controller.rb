class CommentsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def index
        @comments = Comment.all
        render json: @comments
    end

    def index_by_post
        @comments = Comment.where(pid: params[:pid]).order(created_at: :desc)
        render json: @comments
    end

    def create
        @comment = Comment.new(comment_params)
        if @comment.save
            render json: @comment, status: :created
        else
            render json: @comment.errors, status: :unprocessable_entity
        end
    end

    def destroy_by_pid
        @comments = Comment.where(pid: params[:pid])

        if @comments.exists?
            @comments.destroy_all
            render json: { message: "Comments with pid #{params[:pid]} have been deleted." }, status: :ok
        else
            render json: { message: "Comments with pid #{params[:pid]} not found." }, status: :not_found
        end
    end

    private
    def comment_params
        params.permit(:content, :username, :pid)
    end
end
