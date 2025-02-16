document.addEventListener("DOMContentLoaded", () => {
  const URL = "https://apiflowershop.onrender.com/api";
  var localities = [];
  var municipalities = [];
  var users = [];

  const formulario = document.getElementById("formulario-registro");
  const localidadSelect = document.getElementById("localidad");
  const municipioSelect = document.getElementById("municipio");
  const listaRegistros = document.getElementById("lista");

  // Modales de Bootstrap
  const loadingModal = new bootstrap.Modal(
    document.getElementById("loadingModal")
  );

  const loadingModalPost = new bootstrap.Modal(
    document.getElementById("loadingModalPost")
  );

  const successModal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));

  // Función para mostrar el modal de loading post
  function showLoadingPost() {
    loadingModalPost.show();
  }

  // Función para ocultar el modal de loading post
  function hideLoadingPost() {
    loadingModalPost.hide();
  }

  // Función para mostrar el modal de loading
  function showLoading() {
    loadingModal.show();
  }

  // Función para ocultar el modal de loading
  function hideLoading() {
    loadingModal.hide();
  }

  // Función para mostrar el modal de éxito
  function showSuccess() {
    successModal.show();
  }

  // Función para mostrar el modal de error
  function showError() {
    errorModal.show();
  }

  // Cargar municipios y usuarios al inicio
  showLoading();
  GetAllMunicipalities(URL)
    .then((data) => {
      municipalities = data;
      return GetAllUsers(URL);
    })
    .then((data) => {
      users = data;
      mostrarDatosEnLista(users);
      hideLoading();
    })
    .catch((error) => {
      console.error(error);
      hideLoading();
      showError();
    });

  municipioSelect.addEventListener("change", async (e) => {
    const value = e.target.value;
    const municipality = municipalities.find(
      (municipality) => municipality.nombre === value
    );

    if (municipality) {
      const municipalityId = municipality.id;
      localidadSelect.innerHTML = "";

      try {
        localities = await GetLocalitiesPerMunicipality(URL, municipalityId);
        localities.forEach((locality) => {
          const newOptionCreated = document.createElement("option");
          newOptionCreated.value = locality.nombre;
          newOptionCreated.textContent = locality.nombre;
          localidadSelect.appendChild(newOptionCreated);
        });
      } catch (error) {
        console.error(error);
        hideLoading();
        showError();
      }
    } else {
      console.error("Municipio no encontrado");
    }
  });

  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formulario);
    const data = Object.fromEntries(formData.entries());

    showLoadingPost();
    try {
      await PostUserData(URL, data);
      users = await GetAllUsers(URL);
      mostrarDatosEnLista(users);
      //Aquí reseteamos el formulario
      formulario.reset();
      hideLoadingPost();
      showSuccess();
    } catch (error) {
      console.error(error);
      hideLoadingPost();
      showError();
    }
  });
});

// Obtener los municipios
async function GetAllMunicipalities(URL) {
  URL = `${URL}/municipios`;
  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error("Fallo en la obtención de municipios");
    }
    const data = await response.json();
    if (data) {
      const municipalitiesSelect = document.getElementById("municipio");
      data.forEach((municipality) => {
        const newOptionCreated = document.createElement("option");
        newOptionCreated.value = municipality.nombre;
        newOptionCreated.textContent = municipality.nombre;
        municipalitiesSelect.appendChild(newOptionCreated);
      });
      return data;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Obtener las localidades de cada municipio
async function GetLocalitiesPerMunicipality(URL, municipalityId) {
  URL = `${URL}/localidades`;
  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error(
        `Fallo al obtener las localidades del municipio: ${municipalityId}`
      );
    }
    const data = await response.json();
    if (data) {
      const filteredLocalities = data.filter(
        (locality) => locality.id_municipio === municipalityId
      );
      return filteredLocalities;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Insertar un nuevo usuario
async function PostUserData(URL, data) {
  URL = `${URL}/usuarios`;
  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Fallo al intentar insertar un registro de usuario");
    }
    const result = await response.json();
    console.log("Datos enviados con éxito ", result);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Obtener todos los usuarios
async function GetAllUsers(URL) {
  URL = `${URL}/usuarios`;
  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error("Fallo en la obtención de los usuarios");
    }
    const data = await response.json();
    if (data) {
      return data;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Función para mostrar los datos en la lista de registros
function mostrarDatosEnLista(data) {
  const listaRegistros = document.getElementById("lista");
  listaRegistros.innerHTML = "";

  // Invertir el array de datos
  const reversedData = data.slice().reverse();

  reversedData.forEach((user) => {
    const nuevoRegistro = document.createElement("li");
    nuevoRegistro.className =
      "list-group-item d-flex justify-content-between align-items-start mb-2";

    const contentDiv = document.createElement("div");
    contentDiv.className = "ms-2 me-auto";

    const nameDiv = document.createElement("div");
    nameDiv.className = "fw-bold";
    nameDiv.textContent = `${user.nombre} ${user.apellidos}`;

    const addressDiv = document.createElement("div");
    addressDiv.className = "text-muted small";
    addressDiv.textContent = user.direccion;

    const locationDiv = document.createElement("div");
    locationDiv.className = "small";
    locationDiv.innerHTML = `<i class="bi bi-geo-alt-fill text-primary"></i> ${user.localidad}, ${user.municipio}`;

    contentDiv.appendChild(nameDiv);
    contentDiv.appendChild(addressDiv);
    contentDiv.appendChild(locationDiv);

    const badgeDiv = document.createElement("span");
    badgeDiv.className = "badge bg-primary rounded-pill";
    badgeDiv.textContent = user.id;

    nuevoRegistro.appendChild(contentDiv);
    nuevoRegistro.appendChild(badgeDiv);

    listaRegistros.appendChild(nuevoRegistro);
  });
}
