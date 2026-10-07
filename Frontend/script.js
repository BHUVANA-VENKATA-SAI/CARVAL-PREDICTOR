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
// CAR DATA
// ==========================================

let carData = [];


// ==========================================
// LOAD CAR DATA FROM CSV
// ==========================================

async function loadCarData() {

    try {

        console.log("Loading car dataset...");


        // IMPORTANT:
        // Dataset is outside Frontend folder
        const response = await fetch(
            "../Dataset/Car Price.csv"
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load Car Price.csv"
            );

        }


        const csvText = await response.text();


        console.log(
            "CSV loaded successfully."
        );


        // ==========================================
        // SPLIT CSV INTO LINES
        // ==========================================

        const lines = csvText
            .trim()
            .split(/\r?\n/);


        if (lines.length < 2) {

            throw new Error(
                "CSV file is empty."
            );

        }


        // ==========================================
        // CSV LINE PARSER
        // Handles commas inside quotes
        // ==========================================

        function parseCSVLine(line) {

            const result = [];

            let current = "";

            let insideQuotes = false;


            for (
                let i = 0;
                i < line.length;
                i++
            ) {

                const character = line[i];


                // ----------------------------------
                // QUOTES
                // ----------------------------------

                if (character === '"') {

                    // Handle double quotes
                    if (
                        insideQuotes &&
                        line[i + 1] === '"'
                    ) {

                        current += '"';

                        i++;

                    }

                    else {

                        insideQuotes =
                            !insideQuotes;

                    }

                }


                // ----------------------------------
                // COMMA
                // ----------------------------------

                else if (
                    character === "," &&
                    !insideQuotes
                ) {

                    result.push(
                        current.trim()
                    );

                    current = "";

                }


                // ----------------------------------
                // NORMAL CHARACTER
                // ----------------------------------

                else {

                    current += character;

                }

            }


            // Add last value
            result.push(
                current.trim()
            );


            return result;

        }


        // ==========================================
        // GET CSV HEADERS
        // ==========================================

        const headers =
            parseCSVLine(lines[0]);


        console.log(
            "CSV Headers:",
            headers
        );


        // Find Brand column
        const brandIndex =
            headers.indexOf("Brand");


        // Find Model column
        const modelIndex =
            headers.indexOf("Model");


        // ==========================================
        // CHECK REQUIRED COLUMNS
        // ==========================================

        if (
            brandIndex === -1 ||
            modelIndex === -1
        ) {

            throw new Error(
                "Brand or Model column was not found in CSV."
            );

        }


        console.log(
            "Brand column index:",
            brandIndex
        );


        console.log(
            "Model column index:",
            modelIndex
        );


        // ==========================================
        // READ ALL CAR ROWS
        // ==========================================

        for (
            let i = 1;
            i < lines.length;
            i++
        ) {

            // Skip empty lines
            if (!lines[i].trim()) {

                continue;

            }


            const row =
                parseCSVLine(lines[i]);


            const brand =
                row[brandIndex];


            const model =
                row[modelIndex];


            // Only add valid records
            if (
                brand &&
                model
            ) {

                carData.push({

                    brand:
                        brand.trim(),

                    model:
                        model.trim()

                });

            }

        }


        console.log(
            "Total car records:",
            carData.length
        );


        // ==========================================
        // REMOVE DUPLICATE BRAND + MODEL
        // ==========================================

        const uniqueCars = [];

        const seen = new Set();


        carData.forEach(
            function (car) {

                const key =
                    car.brand +
                    "|||" +
                    car.model;


                if (!seen.has(key)) {

                    seen.add(key);

                    uniqueCars.push(car);

                }

            }
        );


        carData =
            uniqueCars;


        console.log(
            "Unique car combinations:",
            carData.length
        );


        // ==========================================
        // GET UNIQUE COMPANIES
        // ==========================================

        const brands = [
            ...new Set(
                carData.map(
                    function (car) {
                        return car.brand;
                    }
                )
            )
        ];


        // Sort alphabetically
        brands.sort();


        console.log(
            "Companies found:",
            brands
        );


        // ==========================================
        // ADD COMPANIES TO DROPDOWN
        // ==========================================

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
            "Company dropdown populated."
        );

    }


    catch (error) {

        console.error(
            "CSV Loading Error:",
            error
        );


        alert(
            "Unable to load car dataset.\n\n" +
            "Make sure you are running Frontend/index.html " +
            "using Live Server."
        );

    }

}


// ==========================================
// COMPANY → MODEL DROPDOWN
// ==========================================

brandSelect.addEventListener(
    "change",
    function () {


        const selectedBrand =
            brandSelect.value;


        console.log(
            "Selected Company:",
            selectedBrand
        );


        // ==========================================
        // RESET MODEL DROPDOWN
        // ==========================================

        modelSelect.innerHTML =
            '<option value="">Select Model</option>';


        // ==========================================
        // NO COMPANY SELECTED
        // ==========================================

        if (!selectedBrand) {

            modelSelect.disabled =
                true;

            return;

        }


        // ==========================================
        // FIND MODELS FOR SELECTED COMPANY
        // ==========================================

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

        ];


        // Sort models
        models.sort();


        console.log(
            "Models found:",
            models
        );


        // ==========================================
        // ADD MODELS TO DROPDOWN
        // ==========================================

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


        // ==========================================
        // ENABLE MODEL DROPDOWN
        // ==========================================

        modelSelect.disabled =
            false;


        console.log(
            "Model dropdown populated."
        );

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


        // Stop page refresh
        event.preventDefault();


        // ==========================================
        // GET FORM VALUES
        // ==========================================

        const brand =
            document
                .getElementById("brand")
                .value;


        const model =
            document
                .getElementById("model")
                .value;


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


        // ==========================================
        // VALIDATION
        // ==========================================

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


        // ==========================================
        // SHOW RESULT BOX
        // ==========================================

        resultBox.style.display =
            "block";


        priceElement.innerText =
            "Predicting...";


        // ==========================================
        // PREPARE DATA FOR FASTAPI
        // ==========================================

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


            // --------------------------------------
            // IMPORTANT
            // --------------------------------------
            // Your CURRENT trained model/backend
            // still expects Owner.
            //
            // Owner is NOT displayed in frontend.
            //
            // We are sending First Owner internally
            // only to keep your existing model working.
            // --------------------------------------

            Owner:
                "First Owner"

        };


        console.log(
            "Data sent to API:",
            carDataToSend
        );


        // ==========================================
        // SEND REQUEST TO FASTAPI
        // ==========================================

        try {

            const response =
                await fetch(
                    "https://carval-predictor.onrender.com/predict",
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


            // ==========================================
            // CHECK RESPONSE
            // ==========================================

            if (!response.ok) {

                const errorText =
                    await response.text();


                console.error(
                    "API Error:",
                    errorText
                );


                throw new Error(
                    "Prediction request failed."
                );

            }


            // ==========================================
            // GET RESPONSE
            // ==========================================

            const data =
                await response.json();


            console.log(
                "Prediction response:",
                data
            );


            // ==========================================
            // FORMAT PRICE
            // ==========================================

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


            // ==========================================
            // DISPLAY PRICE
            // ==========================================

            priceElement.innerText =
                formattedPrice;

        }


        catch (error) {

            console.error(
                "Prediction Error:",
                error
            );


            priceElement.innerText =
                "Prediction Failed";


            alert(
                "Unable to connect to the prediction server.\n\n" +
                "Please try again."
            );

        }

    }
);