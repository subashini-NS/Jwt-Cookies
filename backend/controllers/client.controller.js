import Client from "../models/Client.js";

/* -------------------------------------------------------------------------- */
/*                               CREATE CLIENT                                 */
/* -------------------------------------------------------------------------- */
export const createClient = async (req, res, next) => {
  try {
    const client = await Client.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Client created successfully",
      client,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                                GET CLIENTS                                  */
/* -------------------------------------------------------------------------- */
export const getClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Client.countDocuments(query);

    res.status(200).json({
      data: clients,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                              GET CLIENT BY ID                               */
/* -------------------------------------------------------------------------- */
export const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                               UPDATE CLIENT                                 */
/* -------------------------------------------------------------------------- */
export const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user.id,
      },
      { new: true, runValidators: true },
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                               DELETE CLIENT                                  */
/* -------------------------------------------------------------------------- */
export const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
