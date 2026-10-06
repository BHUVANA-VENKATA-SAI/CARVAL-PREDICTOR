const form = document.getElementById("predictionForm");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const resultBox = document.getElementById("result");
    const priceElement = document.getElementById("price");

    // Get values from form
    const brand = document.getElementById("brand").value;
    const model = document.getElementById("model").value;
    const year = Number(document.getElementById("year").value);
    const kmDriven = Number(
        document.getElementById("km_driven").value
    );

    const fuel = document.getElementById("fuel").value;
    const sellerType = document.getElementById("seller_type").value;
    const transmission = document.getElementById("transmission").value;
    const owner = document.getElementById("owner").value;


    // Check inputs
    if (
        !brand ||
        !model ||
        !year ||
        !kmDriven ||
        !fuel ||
        !sellerType ||
        !transmission ||
        !owner
    ) {

        alert("Please fill all the car details.");

        return;
    }


    // Show loading
    priceElement.innerText = "Predicting...";

    resultBox.style.display = "block";


    // Data for FastAPI
    const carData = {

        Brand: brand,

        Model: model,

        Year: year,

        KM_Driven: kmDriven,

        Fuel: fuel,

        Seller_Type: sellerType,

        Transmission: transmission,

        Owner: owner
    };


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/predict",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(carData)
            }
        );


        if (!response.ok) {

            throw new Error(
                "Prediction request failed."
            );
        }


        const data = await response.json();


        // Format price
        const formattedPrice =
            new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(data.predicted_price);


        // Display result
        priceElement.innerText =
            formattedPrice;


    } catch (error) {

        console.error(error);

        priceElement.innerText =
            "Prediction Failed";

        alert(
            "Unable to connect to the ML backend. " +
            "Make sure FastAPI is running."
        );

    }

});