class CreateServiceRequests < ActiveRecord::Migration[7.1]
  def change
    create_table :service_requests do |t|
      t.references :customer, null: false, foreign_key: true
      t.text :description
      t.string :status

      t.timestamps
    end
  end
end
