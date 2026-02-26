class Customer < ApplicationRecord
  has_many :service_requests, dependent: :destroy
end
