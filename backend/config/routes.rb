Rails.application.routes.draw do
  mount ActionCable.server => "/cable"

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :customers, only: [:index, :show, :create, :update, :destroy]
      resources :organizations, only: [:index, :show, :create, :update, :destroy] do
        resources :time_slots, only: [:index, :show, :create, :update, :destroy]
      end
      resources :service_requests, only: [:index, :show, :create, :update, :destroy]
    end
  end
end
