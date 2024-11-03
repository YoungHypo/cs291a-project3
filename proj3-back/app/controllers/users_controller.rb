class UsersController < ApplicationController
    skip_before_action :verify_authenticity_token

    def create
        @user = User.find_or_create_by(username: params[:username])
        if @user.save
            render json: @user, status: :created
        else
            render json: @user.errors, status: :unprocessable_entity
        end
    end
    
    def index
        @users = User.all
        render json: @users
    end
end
