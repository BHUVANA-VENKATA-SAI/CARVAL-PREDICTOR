```javascript
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
// DATA
// ==========================================

let carData = [];


// ==========================================
// LOAD CSV DATA
// ==========================================

async function loadCarData() {

    try {

        const response = await fetch("Car Price.csv");

        if (!response.ok) {

            throw new Error(
                "Unable to load Car Price.csv"
            );

        }


        const csvText = await response.text();


        // Split CSV into lines
        const lines = csvText
            .trim()
            .split(/\r?\n/);


        if (lines.length < 2) {

            throw new Error(
                "CSV file is empty"
            );

        }


        // ------------------------------------------
        // Parse CSV properly
        // ------------------------------------------

        function parseCSVLine(line) {

            const result = [];

            let current = "";

            let insideQuotes = false;


            for (let i = 0; i < line.length; i++) {

                const character = line[i];


                if (character === '"') {

                    if (
                        insideQuotes &&
                        line[i + 1] === '"'
                    ) {

                        current += '"';

                        i++;

                    } else {

                        insideQuotes =
                            !insideQuotes;

                    }

                }

                else if (
                    character === "," &&
                    !insideQuotes
                ) {

                    result.push(
                        current.trim()
                    );

                    current = "";

                }

                else {

                    current += character;

                }

            }


            result.push(
                current.trim()
            );


            return result;

        }


        // Get headers
        const headers =
            parseCSVLine(lines[0]);


        const brandIndex =
            headers.indexOf("Brand");


        const modelIndex =
            headers.indexOf("Model");


        if (
            brandIndex === -1 ||
            modelIndex === -1
        ) {

            throw new Error(
                "Brand or Model column not found in CSV"
            );

        }


        // ------------------------------------------
        // Read rows
        // ------------------------------------------

        for (
            let i = 1;
            i < lines.length;
            i++
        ) {

            if (!lines[i].trim()) {
                continue;
            }


            const row =
                parseCSVLine(lines[i]);


            const brand =
                row[brandIndex];


            const model =
                row[modelIndex];


            if (
                brand &&
                model
            ) {

                carData.push({

                    brand: brand,

                    model: model

                });

            }

        }


        // ------------------------------------------
        // Remove duplicates
        // ------------------------------------------

        const uniqueCars = [];

        const seen = new Set();


        carData.forEach(car => {

            const key =
                `${car.brand}|||${car.model}`;


            if (!seen.has(key)) {

                seen.add(key);

                uniqueCars.push(car);

            }

        });


        carData = uniqueCars;


        // ------------------------------------------
        // Create Company / Brand list
        // ------------------------------------------

        const brands = [
            ...new Set(
                carData.map(
                    car => car.brand
                )
            )
        ].sort();


        brands.forEach(brand => {

            const option =
                document.createElement("option");


            option.value = brand;

            option.textContent = brand;


            brandSelect.appendChild(
                option
            );

        });


        console.log(
            "Car dataset loaded successfully."
        );


        console.log(
            "Companies:",
            brands.length
        );


        console.log(
            "Brand + Model combinations:",
            carData.length
        );

    }


    catch (error) {

        console.error(
            "CSV loading error:",
            error
        );


        alert(
            "Unable to load Car Price.csv. " +
            "Make sure it is inside the same folder as index.html."
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
            this.value;


        // Reset model dropdown
        modelSelect.innerHTML =
            '<option value="">Select Model</option>';


        // Disable model if no company
        if (!selectedBrand) {

            modelSelect.disabled = true;

            return;

        }


        // Find models belonging to selected brand
        const models = [
            ...new Set(

                carData

                    .filter(
                        car =>
                            car.brand ===
                            selectedBrand
                    )

                    .map(
                        car =>
                            car.model
                    )

            )
        ].sort();


        // Add models
        models.forEach(model => {

            const option =
                document.createElement("option");


            option.value = model;

            option.textContent = model;


            modelSelect.appendChild(
                option
            );

        });


        // Enable model dropdown
        modelSelect.disabled = false;

    }
);


// ==========================================
// LOAD DATA WHEN PAGE OPENS
// ==========================================

loadCarData();


// ==========================================
// FORM SUBMISSION
// ==========================================

form.addEventListener(
    "submit",
    async function (event) {


        // Prevent page refresh
        event.preventDefault();


        // ------------------------------------------
        // Get values
        // ------------------------------------------

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


        // ------------------------------------------
        // Validate
        // ------------------------------------------

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


        // ------------------------------------------
        // Show result box
        // ------------------------------------------

        resultBox.style.display =
            "block";


        priceElement.innerText =
            "Predicting...";


        // ------------------------------------------
        // Prepare data
        // ------------------------------------------

        const carDataToSend = {

            Brand: brand,

            Model: model,

            Year: year,

            KM_Driven: kmDriven,

            Fuel: fuel,

            Seller_Type: sellerType,

            Transmission: transmission,


            // IMPORTANT:
            // The existing trained ML model
            // expects Owner.
            //
            // Owner is hidden from frontend.
            // We use First Owner internally.

            Owner: "First Owner"

        };


        console.log(
            "Sending prediction data:",
            carDataToSend
        );


        // ------------------------------------------
        // SEND TO FASTAPI
        // ------------------------------------------

        try {

            const response =
                await fetch(
                    "https://carval-predictor.onrender.com/predict",
                    {

                        method: "POST",

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


            // --------------------------------------
            // Check response
            // --------------------------------------

            if (!response.ok) {

                const errorText =
                    await response.text();


                console.error(
                    "Server error:",
                    errorText
                );


                throw new Error(
                    "Prediction request failed."
                );

            }


            // --------------------------------------
            // Get prediction
            // --------------------------------------

            const data =
                await response.json();


            console.log(
                "Prediction response:",
                data
            );


            // --------------------------------------
            // Format Indian currency
            // --------------------------------------

            const formattedPrice =
                new Intl.NumberFormat(
                    "en-IN",
                    {

                        style: "currency",

                        currency: "INR",

                        maximumFractionDigits: 0

                    }
                ).format(
                    data.predicted_price
                );


            // --------------------------------------
            // Display price
            // --------------------------------------

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
                "Unable to connect to the prediction server. " +
                "Please try again."
            );

        }

    }
);
```