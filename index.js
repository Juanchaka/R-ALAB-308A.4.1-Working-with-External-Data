import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_Z62f1lXlMjJPAequa5wBZuP0psaRgpvh1h4DFVwD0m3i7BZOctxBZ4qwLPZ0w4ug";
axios.defaults.baseURL = "https://api.thecatapi.com/v1/";
axios.defaults.headers.common["x-api-key"] = API_KEY;

////         FECTCH           ////
// async function initialLoad() {
//   try {
//     const response = await fetch(`https://api.thecatapi.com/v1/breeds/`, {
//       headers: {
//         "x-api-key": API_KEY,
//       },
//     });
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     const parseBreeds = await response.json();
//     parseBreeds.forEach((breed) => {
//       let optionEl = document.createElement("option");
//       optionEl.value = breed.id;
//       optionEl.textContent = breed.name;
//       breedSelect.appendChild(optionEl);
//     });
//   } catch (error) {
//     console.error("Error fetching breeds:", error);
//   }
// }

// breedSelect.addEventListener("change", async (e) => {
//   const breedId = e.target.value;
//   if (!breedId) return;
//   try {
//     const response = await fetch(
//       `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}`,
//       {
//         headers: {
//           "x-api-key": API_KEY,
//         },
//       }
//     );
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     const breedInfo = await response.json();
//     let breed = breedInfo[0].breeds[0];
//     infoDump.innerHTML = `
//     <h3>${breed.name}</h3>
//     <p><bold>Temperament:</bold> ${breed.temperament}</p>
//     <p><bold>Description:</bold> ${breed.description}</p>
//     <p><bold>Origin:</bold> ${breed.origin}</p>
//   `;

//     Carousel.clear();

//     if (breedInfo[0].url) {
//       const carouselItem = Carousel.createCarouselItem(
//         breedInfo[0].url,
//         `Image 1`,
//         breedInfo[0].id
//       );
//       Carousel.appendCarousel(carouselItem);
//     } else {
//       const placeholderImage = "./";
//       const carouselItem = Carousel.createCarouselItem(
//         placeholderImage,
//         "Placeholder Image",
//         "placeholder-id"
//       );
//       Carousel.appendCarousel(carouselItem);
//     };
//     Carousel.start();
//   } catch (error) {
//     console.error("Error fetching breed details:", error);
//     infoDump.innerHTML =
//       "<p>Failed to load breed details. Please try again.</p>";
//   }
//     Carousel.start();
// });

////      AXIOS    ////

async function initialLoad() {
  try {
    const response = await axios.get("breeds");
    const parseBreeds = response.data;
    parseBreeds.forEach((breed) => {
      let optionEl = document.createElement("option");
      optionEl.value = breed.id;
      optionEl.textContent = breed.name;
      breedSelect.appendChild(optionEl);
    });
  } catch (error) {
    console.error("Error fetching breeds:", error);
  };
};

breedSelect.addEventListener("change", async (e) => {
  const breedId = e.target.value;
  if (!breedId) return;

  try {
    const response = await axios.get(`images/search?breed_ids=${breedId}`, {
      onDownloadProgress: updateProgress,
    });
    const breedInfo = response.data[0];

    infoDump.innerHTML = `
      <h3>${breedInfo.breeds[0].name}</h3>
      <p><strong>Temperament:</strong> ${breedInfo.breeds[0].temperament}</p>
      <p><strong>Description:</strong> ${breedInfo.breeds[0].description}</p>
      <p><strong>Origin:</strong> ${breedInfo.breeds[0].origin}</p>
    `;

    Carousel.clear();

    if (breedInfo.url) {
      const carouselItem = Carousel.createCarouselItem(
        breedInfo.url,
        `Image 1`,
        breedInfo.id
      );
      Carousel.appendCarousel(carouselItem);
    } else {
      const placeholderImage = "./";
      const carouselItem = Carousel.createCarouselItem(
        placeholderImage,
        "Placeholder Image",
        "placeholder-id"
      );
      Carousel.appendCarousel(carouselItem);
    };
    Carousel.start();
  } catch (error) {
    console.error("Error fetching breed details:", error);
    infoDump.innerHTML =
      "<p>Failed to load breed details. Please try again.</p>";
  }
});

axios.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    progressBar.style.width = "0%";
    document.body.style.cursor = "progress";
    console.log(`Request started at: ${config.metadata.startTime}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`Response received at: ${endTime}`);
    console.log(`Request duration: ${duration} ms`);
    document.body.style.cursor = "";
    return response;
  },
  (error) => {
    const endTime = new Date();
    const duration = endTime - error.config.metadata.startTime;
    console.log(`Response received at: ${endTime}`);
    console.log(`Request duration: ${duration} ms`);
    document.body.style.cursor = "";
    return Promise.reject(error);
  }
);

function updateProgress(event) {
  if (event.lengthComputable) {
    const percentComplete = Math.round((event.loaded / event.total) * 100);
    progressBar.style.width = `${percentComplete}%`;
    console.log("Progress Event:", event);
  };
};

export async function favourite(imgId) {
  try {
    const response = await axios.get(
      `https://api.thecatapi.com/v1/favourites`,
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const favourite = response.data.find((fav) => fav.image.id === imgId);

    if (favourite) {
      await axios.delete(
        `https://api.thecatapi.com/v1/favourites/${favourite.id}`,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
      console.log(`Removed ${imgId} from favourites.`);
    } else {
      await axios.post(
        `https://api.thecatapi.com/v1/favourites`,
        {
          image_id: imgId,
        },
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      );
      console.log(`Added ${imgId} to favourites.`);
    }
  } catch (error) {
    console.error("Error updating favourites:", error);
  };
};

async function getFavourites() {
  try {
    const response = await axios.get(
      "https://api.thecatapi.com/v1/favourites",
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    Carousel.clear();

    response.data.forEach((favourite) => {
      const carouselItem = Carousel.createCarouselItem(
        favourite.image.url,
        "Favourited Image",
        favourite.image.id
      );
      Carousel.appendCarousel(carouselItem);
    });

    Carousel.start();
  } catch (error) {
    console.error("Error fetching favourites:", error);
  };
};

getFavouritesBtn.addEventListener("click", getFavourites);

initialLoad();
