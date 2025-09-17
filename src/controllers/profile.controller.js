import { handleSuccess, handleErrorClient } from "../Handlers/responseHandlers.js";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
export async function updatePrivateProfile(req, res) {
  const userId = req.user.id;
  const { email, password } = req.body;

  if (!email && !password) {
    return handleErrorClient(res, 400, "Debes enviar email y/o password para modificar.");
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }

    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await userRepository.save(user);
    handleSuccess(res, 200, "Perfil modificado exitosamente", {
      email: user.email,
    });
  } catch (error) {
    handleErrorClient(res, 500, "Error al modificar el perfil", error.message);
  }
}

export function getPublicProfile(req, res) {
  handleSuccess(res, 200, "Perfil público obtenido exitosamente", {
    message: "¡Hola! Este es un perfil público. Cualquiera puede verlo.",
  });
}

export function getPrivateProfile(req, res) {
  const user = req.user;

  handleSuccess(res, 200, "Perfil privado obtenido exitosamente", {
    message: `¡Hola, ${user.email}! Este es tu perfil privado. Solo tú puedes verlo.`,
    userData: user,
  });
}

export async function deletePrivateProfile(req, res) {
  const userId = req.user.id;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }

    await userRepository.remove(user);
    handleSuccess(res, 200, "Perfil eliminado exitosamente", {
      message: "Tu cuenta ha sido eliminada.",
    });
  } catch (error) {
    handleErrorClient(res, 500, "Error al eliminar el perfil", error.message);
  }
}
