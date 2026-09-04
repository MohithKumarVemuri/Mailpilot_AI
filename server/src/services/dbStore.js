import mongoose from 'mongoose';
import { UserModel } from '../models/User.js';
import { IntegrationModel } from '../models/Integration.js';
import { EmailActionModel } from '../models/EmailAction.js';
import { DraftModel } from '../models/Draft.js';

// In-Memory Data Maps for fallback
const memoryStore = {
  users: new Map(),
  integrations: new Map(),
  emailActions: new Map(),
  drafts: new Map()
};

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function generateId() {
  return new mongoose.Types.ObjectId().toString();
}

/* ================= USER STORE ================= */
export const userStore = {
  async findByEmail(email, includePassword = false) {
    const normalized = email.toLowerCase().trim();
    if (isMongoConnected()) {
      const q = UserModel.findOne({ email: normalized });
      if (includePassword) q.select('+password +googleTokens');
      return await q.exec();
    }
    for (const u of memoryStore.users.values()) {
      if (u.email.toLowerCase() === normalized) {
        return { ...u };
      }
    }
    return null;
  },

  async findById(id, includePassword = false) {
    if (isMongoConnected()) {
      const q = UserModel.findById(id);
      if (includePassword) q.select('+password +googleTokens');
      return await q.exec();
    }
    const u = memoryStore.users.get(id.toString());
    return u ? { ...u } : null;
  },

  async ensureUserFromToken(decoded) {
    if (!decoded || !decoded.id) return null;
    if (isMongoConnected()) {
      // In Mongo mode, try finding user; if not found, we shouldn't invent an arbitrary user
      return await UserModel.findById(decoded.id).exec();
    }
    let u = memoryStore.users.get(decoded.id.toString());
    if (!u) {
      u = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email ? decoded.email.toLowerCase().trim() : '',
        createdAt: new Date(),
        lastLogin: new Date()
      };
      memoryStore.users.set(decoded.id.toString(), u);
    }
    return { ...u };
  },

  async create(userData) {
    if (isMongoConnected()) {
      const user = new UserModel(userData);
      return await user.save();
    }
    const id = generateId();
    const doc = {
      _id: id,
      id,
      ...userData,
      email: userData.email.toLowerCase().trim(),
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.users.set(id, doc);
    return { ...doc };
  },

  async updateLastLogin(id) {
    if (isMongoConnected()) {
      return await UserModel.findByIdAndUpdate(id, { lastLogin: new Date() });
    }
    const u = memoryStore.users.get(id.toString());
    if (u) {
      u.lastLogin = new Date();
      u.updatedAt = new Date();
      memoryStore.users.set(id.toString(), u);
    }
    return u;
  }
};

/* ================= INTEGRATION STORE ================= */
export const integrationStore = {
  async findByOwner(ownerId) {
    const oId = ownerId.toString();
    if (isMongoConnected()) {
      return await IntegrationModel.findOne({ owner: oId });
    }
    for (const integ of memoryStore.integrations.values()) {
      if (integ.owner.toString() === oId) {
        return { ...integ };
      }
    }
    return null;
  },

  async upsert(ownerId, data) {
    const oId = ownerId.toString();
    if (isMongoConnected()) {
      return await IntegrationModel.findOneAndUpdate(
        { owner: oId },
        { $set: { ...data, owner: oId } },
        { upsert: true, new: true }
      );
    }
    let existing = null;
    let existingId = null;
    for (const [id, integ] of memoryStore.integrations.entries()) {
      if (integ.owner.toString() === oId) {
        existing = integ;
        existingId = id;
        break;
      }
    }
    const updated = {
      _id: existingId || generateId(),
      owner: oId,
      provider: 'gmail',
      isConnected: true,
      ...(existing || {}),
      ...data,
      updatedAt: new Date(),
      createdAt: existing ? existing.createdAt : new Date()
    };
    memoryStore.integrations.set(updated._id.toString(), updated);
    return { ...updated };
  },

  async delete(ownerId) {
    const oId = ownerId.toString();
    if (isMongoConnected()) {
      return await IntegrationModel.findOneAndDelete({ owner: oId });
    }
    for (const [id, integ] of memoryStore.integrations.entries()) {
      if (integ.owner.toString() === oId) {
        memoryStore.integrations.delete(id);
        return true;
      }
    }
    return false;
  }
};

/* ================= EMAIL ACTION STORE ================= */
export const emailActionStore = {
  async create(data) {
    if (isMongoConnected()) {
      const action = new EmailActionModel(data);
      return await action.save();
    }
    const id = generateId();
    const doc = {
      _id: id,
      id,
      ...data,
      status: data.status || 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.emailActions.set(id, doc);
    return { ...doc };
  },

  async update(id, updates) {
    if (isMongoConnected()) {
      return await EmailActionModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
    }
    const a = memoryStore.emailActions.get(id.toString());
    if (a) {
      Object.assign(a, updates, { updatedAt: new Date() });
      memoryStore.emailActions.set(id.toString(), a);
      return { ...a };
    }
    return null;
  },

  async findByOwner(ownerId, limit = 50) {
    const oId = ownerId.toString();
    if (isMongoConnected()) {
      return await EmailActionModel.find({ owner: oId }).sort({ createdAt: -1 }).limit(limit);
    }
    const results = [];
    for (const action of memoryStore.emailActions.values()) {
      if (action.owner.toString() === oId) {
        results.push({ ...action });
      }
    }
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
  },

  async findById(id) {
    if (isMongoConnected()) {
      return await EmailActionModel.findById(id);
    }
    const a = memoryStore.emailActions.get(id.toString());
    return a ? { ...a } : null;
  }
};

/* ================= DRAFT STORE ================= */
export const draftStore = {
  async create(data) {
    if (isMongoConnected()) {
      const draft = new DraftModel(data);
      return await draft.save();
    }
    const id = generateId();
    const doc = {
      _id: id,
      id,
      ...data,
      wasSent: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.drafts.set(id, doc);
    return { ...doc };
  },

  async findByThread(ownerId, threadId) {
    const oId = ownerId.toString();
    if (isMongoConnected()) {
      return await DraftModel.findOne({ owner: oId, gmailThreadId: threadId }).sort({ createdAt: -1 });
    }
    for (const draft of Array.from(memoryStore.drafts.values()).reverse()) {
      if (draft.owner.toString() === oId && draft.gmailThreadId === threadId) {
        return { ...draft };
      }
    }
    return null;
  },

  async update(id, updates) {
    if (isMongoConnected()) {
      return await DraftModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
    }
    const d = memoryStore.drafts.get(id.toString());
    if (d) {
      Object.assign(d, updates, { updatedAt: new Date() });
      memoryStore.drafts.set(id.toString(), d);
      return { ...d };
    }
    return null;
  }
};
