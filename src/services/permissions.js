const permissions = {
  admin: {
    clases: {
      leer: true,
      crear: true,
      modificar: true,
      eliminar: true,
    },

    residentes: {
      leer: true,
      crear: true,
      modificar: true,
      eliminar: true,
    },

    evaluaciones: {
      leer: true,
      crear: true,
      modificar: true,
      eliminar: true,
    },
  },

  resident: {
    clases: {
      leer: true,
      crear: false,
      modificar: false,
      eliminar: false,
    },

    residentes: {
      leer: true,
      crear: false,
      modificar: false,
      eliminar: false,
    },

    evaluaciones: {
      leer: true,
      crear: false,
      modificar: false,
      eliminar: false,
    },
  },
};

export function hasPermission(role, resource, action) {
  return Boolean(permissions?.[role]?.[resource]?.[action]);
}
