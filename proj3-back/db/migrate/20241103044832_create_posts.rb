class CreatePosts < ActiveRecord::Migration[7.2]
  def change
    create_table :posts, primary_key: :pid do |t|
      t.text :content
      t.string :username
      t.string :comments

      t.timestamps
    end
  end
end
