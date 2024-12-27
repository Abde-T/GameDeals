import {
  Client,
  Account,
  ID,
  Databases,
  OAuthProvider,
  Avatars,
  Query,
  Storage,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import axios from "axios";
import { useEffect, useState } from "react";

export const config = {
  platform: "com.jsm.restate",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
  propertiesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
  favGamesCollectionId:
    process.env.EXPO_PUBLIC_APPWRITE_FAV_GAMES_COLLECTION_ID,
};

export const client = new Client();
client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export async function login() {
  try {
    const redirectUri = Linking.createURL("/");

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );
    if (!response) throw new Error("Create OAuth2 token failed");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    if (browserResult.type !== "success")
      throw new Error("Create OAuth2 token failed");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Create OAuth2 token failed");

    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getUserId() {
  const user = await account.get();
  if (user) {
    return user.$id;
  } else {
    // Handle the case where "userId" is missing
    console.warn('User object does not contain a "userId" property');
    return null; // Or return an appropriate default value
  }
}

export async function logout() {
  try {
    const result = await account.deleteSession("current");
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const result = await account.get();
    if (result.$id) {
      const userAvatar = avatar.getInitials(result.name);

      return {
        ...result,
        avatar: userAvatar.toString(),
      };
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getLatestProperties() {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.orderAsc("$createdAt"), Query.limit(5)]
    );

    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getProperties({
  filter,
  query,
  limit,
}: {
  filter: string;
  query: string;
  limit?: number;
}) {
  try {
    const buildQuery = [Query.orderDesc("$createdAt")];

    if (filter && filter !== "All")
      buildQuery.push(Query.equal("type", filter));

    if (query)
      buildQuery.push(
        Query.or([
          Query.search("name", query),
          Query.search("address", query),
          Query.search("type", query),
        ])
      );

    if (limit) buildQuery.push(Query.limit(limit));

    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      buildQuery
    );

    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// write function to get property by id
export async function getPropertyById({ id }: { id: string }) {
  try {
    const result = await databases.getDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      id
    );
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getFeaturedDeals(limit: number = 5) {
  try {
    const response = await axios.get(
      "https://www.cheapshark.com/api/1.0/deals",
      {
        params: {
          pageSize: limit,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching deals:", error);
    return [];
  }
}

export async function getGames(title: string | undefined) {
  try {
    const response = await axios.get(
      "https://www.cheapshark.com/api/1.0/games",
      {
        params: {
          title: title, // User-defined limit for the number of games
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching all games:", error);
    return [];
  }
}

export async function getGameById(id: string | undefined) {
  console.log("id", id);

  try {
    const response = await axios.get(
      `https://www.cheapshark.com/api/1.0/games?id=${id}`
    );
    console.log("response", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error("Error fetching game by ID:", error);
    return null;
  }
}

export async function getStoreById(storeId: string) {
  try {
    const response = await axios.get(
      "https://www.cheapshark.com/api/1.0/stores"
    );

    // Find the store by its ID
    const store = response.data.find(
      (store: { storeID: string | number }) => String(store.storeID) === storeId
    );

    if (!store) {
      return [];
    }

    return store;
  } catch (error) {
    console.error("Error fetching store by ID:", error);
    return null;
  }
}

export async function fetchFavoriteGames(userId: string) {
  try {
    const response = await databases.listDocuments(
      config.databaseId!,
      config.favGamesCollectionId!,
      [Query.equal("userId", userId)]
    );
    return response.documents; // This contains an array of your documents
  } catch (error) {
    console.error("Error fetching favorite games:", error);
    return [];
  }
}

export async function deleteGame(documentId: string) {
  console.log('gameID:', documentId);

  try {
    const response = await databases.deleteDocument(
      config.databaseId!,
      config.favGamesCollectionId!,
      documentId
    );

    console.log('Document deleted successfully:', response);
    return response; 
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error; // Re-throw the error for proper handling in the calling code
  }
}