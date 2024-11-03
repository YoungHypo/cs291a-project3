class CreateComments < ActiveRecord::Migration[7.2]
  def change
    create_table :comments, primary_key: :cid do |t|
      t.text :content
      t.string :username
      t.integer :pid

      t.timestamps
    end
  end
end
