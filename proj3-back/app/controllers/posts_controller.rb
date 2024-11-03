class PostsController < ApplicationController
    skip_before_action :verify_authenticity_token
  
    def index
        @posts = Post.order(created_at: :desc)
        render json: @posts
    end

    def show
        @post = Post.find(params[:id])
        render json: @post
    end

    def index_by_user
        @posts = Post.where(username: params[:username]).order(updated_at: :desc)
        render json: @posts
    end
  
    def create
        
        @post = Post.new(post_params)
        if @post.save
            render json: @post, status: :created
        else
            render json: @post.errors, status: :unprocessable_entity
        end
    end

    def update
        @post = Post.find(params[:id])
        if @post.update(post_params)
            render json: @post, status: :ok
        else
            render json: @post.errors, status: :unprocessable_entity
        end
    end

    def destroy
        @post = Post.find(params[:id])
        @post.destroy
        render json: @post, status: :ok
    end
  
    private
    def post_params
      params.permit(:content, :username, :comments)
    end
  end
  