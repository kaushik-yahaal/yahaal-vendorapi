Project Name
    Yahaal Vendor Dashboard
Description
    This project consists of API where Vendors can list the services with/without payment and customers can book it from front-end
Installation
    $ git clone https://github.com/kaushik-yahaal/yahaal-vendorapi.git
    $ cd yahaal-vendorapi
    $ npm install
Usage
    This section shows how to use API endpoints
        POST API/vendor-register
        {
           "vendor_name": "John Wick",
            "vendor_email": "john99@gmail.com",
            "password": "test1234",
            "vendor_contact": 5678901234,
            "instagram_account": "https://instagram.com/john99"
        }
Endpoints
    This section lists down all endpoints
        POST/Add Service - This API will add all new service on the platform.
        GET/Get All Service - This will show list of all servcies listed by a Vendor
        POST/Edit Service - This API will be used to Edit Existing listed Service
        POST Delete Service - This API will delete existing service added by Vendor
        POST Vendor Registration - This API will be used to Register Vendor on the platform
        POST Vendor Login - Vendor will be able to Login to his/her Dashboard
        GET Get All vendors - This would show list of all Vendors added to the platform
        POST Remove Vendor - Site Admin can delete Vendor using this API
        POST Approve vendor - When any new Vendor register on the platform. Admin will have an option to Accept/Reject Vendor Joining Request
        GET Request Password Reset - Vendor will be able to request password request
        POST Reset password - This API will be used to reset Vendor Password when s/he request for password reset
Authentication
    We have used JWT Token as a mode of Authentication for this project
