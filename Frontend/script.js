// ==========================================
// CARVAL-PREDICTOR
// Used Car Price Prediction
// ==========================================


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const form = document.getElementById("predictionForm");

const brandSelect = document.getElementById("brand");

const modelSelect = document.getElementById("model");

const resultBox = document.getElementById("result");

const priceElement = document.getElementById("price");


// ==========================================
// BACKEND API URL
// ==========================================

const API_URL =
    "https://carval-predictor.onrender.com";


// ==========================================
// CAR DATA
// ==========================================

let carData = [];


// ==========================================
// LOAD COMPANY + MODEL DATA
// FROM FASTAPI BACKEND
// ==========================================

async function loadCarData() {

    try {

        console.log(
            "Loading car data from backend..."
        );


        // --------------------------------------
        // CALL /cars API
        // --------------------------------------

        const response = await fetch(
            `${API_URL}/cars`
        );


        // --------------------------------------
        // CHECK RESPONSE
        // --------------------------------------

        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );

        }


        // --------------------------------------
        // CONVERT RESPONSE TO JSON
        // --------------------------------------

        const data = await response.json();


        // --------------------------------------
        // CHECK API ERROR
        // --------------------------------------

        if (data.error) {

            throw new Error(
                data.error
            );

        }


        // --------------------------------------
        // STORE CAR DATA
        // --------------------------------------

        carData = data.map(
            function (car) {

                return {

                    brand: car.Brand,

                    model: car.Model

                };

            }
        );


        console.log(
            "Total car combinations:",
            carData.length
        );


        // ======================================
        // GET UNIQUE COMPANIES
        // ======================================

        const brands = [

            ...new Set(

                carData.map(
                    function (car) {

                        return car.brand;

                    }
                )

            )

        ].sort();


        console.log(
            "Companies found:",
            brands
        );


        // ======================================
        // CLEAR COMPANY DROPDOWN
        // ======================================

        brandSelect.innerHTML =
            '<option value="">Select Company</option>';


        // ======================================
        // ADD COMPANIES
        // ======================================

        brands.forEach(
            function (brand) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    brand;


                option.textContent =
                    brand;


                brandSelect.appendChild(
                    option
                );

            }
        );


        console.log(
            "Company dropdown loaded successfully."
        );

    }


    catch (error) {

        console.error(
            "Car dataset loading error:",
            error
        );


        alert(
            "Unable to load car dataset.\n\n" +
            "Please try again after the backend finishes loading."
        );

    }

}


// ==========================================
// COMPANY → MODEL DROPDOWN
// ==========================================

brandSelect.addEventListener(
    "change",
    function () {


        // --------------------------------------
        // GET SELECTED COMPANY
        // --------------------------------------

        const selectedBrand =
            brandSelect.value;


        console.log(
            "Selected Company:",
            selectedBrand
        );


        // --------------------------------------
        // RESET MODEL DROPDOWN
        // --------------------------------------

        modelSelect.innerHTML =
            '<option value="">Select Model</option>';


        // --------------------------------------
        // DISABLE MODEL IF NO COMPANY
        // --------------------------------------

        if (!selectedBrand) {

            modelSelect.disabled =
                true;

            return;

        }


        // ======================================
        // FIND MODELS FOR COMPANY
        // ======================================

        const models = [

            ...new Set(

                carData

                    .filter(
                        function (car) {

                            return (
                                car.brand ===
                                selectedBrand
                            );

                        }
                    )

                    .map(
                        function (car) {

                            return car.model;

                        }
                    )

            )

        ].sort();


        console.log(
            "Models found:",
            models
        );


        // ======================================
        // ADD MODELS
        // ======================================

        models.forEach(
            function (model) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    model;


                option.textContent =
                    model;


                modelSelect.appendChild(
                    option
                );

            }
        );


        // ======================================
        // ENABLE MODEL DROPDOWN
        // ======================================

        modelSelect.disabled =
            false;

    }
);


// ==========================================
// LOAD DATA WHEN PAGE OPENS
// ==========================================

loadCarData();


// ==========================================
// PREDICTION FORM
// ==========================================

form.addEventListener(
    "submit",
    async function (event) {


        // --------------------------------------
        // PREVENT PAGE REFRESH
        // --------------------------------------

        event.preventDefault();


        // ======================================
        // GET FORM VALUES
        // ======================================

        const brand =
            document
                .getElementById("brand")
                .value
                .trim();


        const model =
            document
                .getElementById("model")
                .value
                .trim();


        const year =
            Number(
                document
                    .getElementById("year")
                    .value
            );


        const kmDriven =
            Number(
                document
                    .getElementById("km_driven")
                    .value
            );


        const fuel =
            document
                .getElementById("fuel")
                .value;


        const sellerType =
            document
                .getElementById("seller_type")
                .value;


        const transmission =
            document
                .getElementById("transmission")
                .value;


        // ======================================
        // VALIDATE INPUT
        // ======================================

        if (

            !brand ||

            !model ||

            !year ||

            !kmDriven ||

            !fuel ||

            !sellerType ||

            !transmission

        ) {

            alert(
                "Please fill all the car details."
            );

            return;

        }


        // ======================================
        // SHOW RESULT
        // ======================================

        resultBox.style.display =
            "block";


        priceElement.innerText =
            "Predicting...";


        // ======================================
        // PREPARE DATA
        // ======================================
        //
        // Owner is removed from the frontend.
        //
        // Your existing trained model still expects
        // Owner, so we provide "First Owner"
        // internally.
        //
        // ======================================

        const carDataToSend = {

            Brand:
                brand,

            Model:
                model,

            Year:
                year,

            KM_Driven:
                kmDriven,

            Fuel:
                fuel,

            Seller_Type:
                sellerType,

            Transmission:
                transmission,

            Owner:
                "First Owner"

        };


        console.log(
            "Sending prediction data:",
            carDataToSend
        );


        // ======================================
        // SEND DATA TO FASTAPI
        // ======================================

        try {

            const response =
                await fetch(
                    `${API_URL}/predict`,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                carDataToSend
                            )

                    }
                );


            // ==================================
            // CHECK RESPONSE
            // ==================================

            if (!response.ok) {

                const errorText =
                    await response.text();


                console.error(
                    "Prediction server error:",
                    errorText
                );


                throw new Error(
                    `Prediction failed (${response.status})`
                );

            }


            // ==================================
            // GET JSON RESPONSE
            // ==================================

            const data =
                await response.json();


            console.log(
                "Prediction response:",
                data
            );


            // ==================================
            // CHECK API ERROR
            // ==================================

            if (data.error) {

                throw new Error(
                    data.error
                );

            }


            // ==================================
            // FORMAT PRICE IN INDIAN RUPEES
            // ==================================

            const formattedPrice =
                new Intl.NumberFormat(
                    "en-IN",
                    {

                        style:
                            "currency",

                        currency:
                            "INR",

                        maximumFractionDigits:
                            0

                    }
                ).format(
                    data.predicted_price
                );


            // ==================================
            // DISPLAY PREDICTED PRICE
            // ==================================

            priceElement.innerText =
                formattedPrice;


        }


        catch (error) {

            console.error(
                "Prediction error:",
                error
            );


            priceElement.innerText =
                "Prediction Failed";


            alert(
                "Unable to connect to the prediction server.\n\n" +
                error.message
            );

        }

    }
);