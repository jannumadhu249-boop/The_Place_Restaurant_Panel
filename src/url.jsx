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

    //Floor Sections
    GetFloorSectionsCards: base_url + "v1/place/restaurant/floor-sections/dashboard",
    GetFloorSections: base_url + "v1/place/restaurant/floor-sections",
    GetActiveFloorSections: base_url + "v1/place/restaurant/dine-in/sessions/active",
    CreateFloorSections: base_url + "v1/place/restaurant/floor-sections/add",
    GetByIdFloorSections: base_url + "v1/place/restaurant/floor-sections/",
    UpdateFloorSections: base_url + "v1/place/restaurant/floor-sections/",
    UpdateStatusFloorSection: base_url + "v1/place/restaurant/floor-sections/",
    DeleteFloorSections: base_url + "v1/place/restaurant/floor-sections/",

    //Tables
    GetTableCards: base_url + "v1/place/restaurant/tables-management/dashboard",
    GetTables: base_url + "v1/place/restaurant/tables-management/tables",
    CreateTables: base_url + "v1/place/restaurant/tables-management/tables/add",
    UpdateTables: base_url + "v1/place/restaurant/tables-management/tables/",
    UpdateTableStatus: base_url + "v1/place/restaurant/tables-management/tables/",
    AssignCaptainTable: base_url + "v1/place/restaurant/tables-management/tables/",
    DeleteTables: base_url + "v1/place/restaurant/tables-management/tables/",

    //Servers
    GetServerCards: base_url + "v1/place/restaurant/floor-staff/dashboard",
    GetActiveServers: base_url + "v1/place/restaurant/floor-staff/active-captains",
    GetServers: base_url + "v1/place/restaurant/floor-staff",
    CreateServers: base_url + "v1/place/restaurant/floor-staff/add",
    UpdateServers: base_url + "v1/place/restaurant/floor-staff/",
    UpdateStatusServer: base_url + "v1/place/restaurant/floor-staff/",
    DeleteServers: base_url + "v1/place/restaurant/floor-staff/",

    //Takeaway
    EnableTakeaway: base_url + "v1/place/restaurant/takeaway/service-status",
    GetTakeawayCards: base_url + "v1/place/restaurant/takeaway/dashboard/summary",
    GetTakeaway: base_url + "v1/place/restaurant/takeaway/orders",
    CreateTakeaway: base_url + "v1/place/restaurant/takeaway/orders",
    UpdateTakeaway: base_url + "v1/place/restaurant/takeaway/orders/",
    UpdateTakeawayStatus: base_url + "v1/place/restaurant/takeaway/orders/",
    UpdateTakeawayPayment: base_url + "v1/place/restaurant/takeaway/orders/",
    GetInvoice: base_url + "v1/place/restaurant/takeaway/orders/",

    //Coupons
    GetActiveCoupons: base_url + "v1/place/admin/coupon/get-active",
    GetCoupons: base_url + "v1/place/admin/coupon/getAll",
    CreateCoupon: base_url + "v1/place/admin/coupon/add",
    UpdateCoupon: base_url + "v1/place/admin/coupon/edit/",
    DeleteCoupon: base_url + "v1/place/admin/coupon/delete/",


}
