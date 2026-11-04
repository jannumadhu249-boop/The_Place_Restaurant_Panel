const base_url = "http://40.192.68.118:3000/"

export const URLS = {

    Base: base_url,
    Image: base_url,

    //Authentication
    Login: base_url + "v1/place/restaurant/auth/login",
    GetProfile: base_url + "v1/place/restaurant/auth/profile",
    UpdateProfile: base_url + "v1/place/restaurant/auth/updateUserDetails",
    UpdateProfilePic: base_url + "v1/place/restaurant/auth/profile-image",
    ForgotPassword: base_url + "v1/place/restaurant/auth/forgot-password",
    VerifyForgotPasswordOTP: base_url + "v1/place/restaurant/auth/verify-otp",
    ResetPassword: base_url + "v1/place/restaurant/auth/reset-password",
    ChangePassword: base_url + "v1/place/restaurant/auth/change-password",

    //Bank Details
    GetBankDetails: base_url + "v1/place/restaurant/bank-details/my-bank-details",
    UpdateBankDetails: base_url + "v1/place/restaurant/bank-details/update",

    //Categories
    GetCatgories: base_url + "v1/place/admin/category/getAllCategories",
    GetActiveCategories: base_url + "v1/place/admin/category/getall-active",

    //Sub-Categories
    GetAllSubcategories: base_url + "v1/place/admin/subcategory/getAllSubcategories",
    GetActiveSubCategories: base_url + "v1/place/admin/subcategory/getall-active",

    //Food Management
    GetFoodMenu: base_url + "v1/place/restaurant/food/menu",
    CreateFoodMenu: base_url + "v1/place/restaurant/food",
    UpdateFoodMenu: base_url + "v1/place/restaurant/food/",
    DeleteFoodMenu: base_url + "v1/place/restaurant/food/",

    //Order Management
    GetOrders: base_url + "v1/place/restaurant/auth/bookings",
    GetByIdOrder: base_url + "v1/place/restaurant/auth/bookings/",
    GetOrderById: base_url + "v1/place/restaurant/auth/bookings/",
    UpdateBookingStatus: base_url + "v1/place/app/booking/update-status",
    AcceptOrder: base_url + "v1/place/app/booking/update-status",
    ConfirmOrder: base_url + "v1/place/app/booking/update-status",
    PreparingOrder: base_url + "v1/place/app/booking/update-status",
    ReadyOrder: base_url + "v1/place/app/booking/update-status",

    //Customer Reviews
    GetReviews: base_url + "v1/place/app/review/restaurant/",

}
