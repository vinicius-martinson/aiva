class Organization < ApplicationRecord
  has_many :time_slots, dependent: :destroy
end
