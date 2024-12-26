import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { config, databases, getGameById, getStoreById } from "@/lib/appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import { ID } from "react-native-appwrite";

type Game = {
  info: {
    title: string;
    steamAppID: string | null;
    thumb: string;
  };
  cheapestPriceEver: {
    price: string;
    date: number;
  };
  deals: {
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
  }[];
};

const Property = () => {
  const { id } = useLocalSearchParams();
  const [stores, setStores] = useState<{ [key: string]: any }>({}); // State to hold store info for each deal
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const loadDeals = async () => {
      const gameDetails = await getGameById(id.toString());
      setGame(gameDetails);

      // Fetch store information for each deal
      const storePromises = gameDetails.deals.map(async (deal) => {
        const storeData = await getStoreById(deal.storeID);
        return { storeID: deal.storeID, storeData };
      });

      const fetchedStores = await Promise.all(storePromises);

      // Convert to an object keyed by storeID
      const storesMap: { [key: string]: any } = {};
      fetchedStores.forEach(({ storeID, storeData }) => {
        storesMap[storeID] = storeData;
      });

      setStores(storesMap);
    };

    loadDeals();
  }, []);

  if (!game) {
    return (
      <SafeAreaView className="h-full bg-[#242424] flex items-center justify-center">
        <Text className="text-lg text-green-300">Loading game details...</Text>
      </SafeAreaView>
    );
  }

  const handlePress = async (title: string, thumb: string) => {
    try {
      console.log("handlePress");
      const property = await databases.createDocument(
        config.databaseId!,
        config.favGamesCollectionId!,
        ID.unique(),
        {
          title: title, // Use the title passed as an argument
          thumb: thumb, // Use the thumb passed as an argument
        }
      );
      console.log("Document created:", property);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };
  return (
    <SafeAreaView className="h-full bg-[#242424]">
      <ScrollView className="p-5">
        {/* Game Thumbnail and Title */}
        <View className="flex items-center mt-5">
          <Image
            source={{ uri: game.info.thumb }}
            className="w-full h-full max-h-72 rounded-lg border-2 border-green-300"
          />
          <Text className="text-xl font-rubik-medium text-green-300 mt-4 text-left">
            {game.info.title}
          </Text>
          <TouchableOpacity
            onPress={() => handlePress(game.info.title, game.info.thumb)}
            className="mt-3"
          >
            <Image
              source={icons.heart}
              className="w-5 h-5 mr-2"
              tintColor="#EF4444"
            />
          </TouchableOpacity>
        </View>

        {/* Cheapest Price Ever */}
        <View className="bg-[#1e1e1e] rounded-lg p-4">
          <Text className="text-lg text-white font-rubik-medium mb-2">
            Cheapest Price Ever
          </Text>
          <Text className="text-green-300 text-base">
            Price:{" "}
            {game.cheapestPriceEver.price == "0.00"
              ? "Free"
              : `$${game.cheapestPriceEver.price}`}
          </Text>
          <Text className="text-gray-400 text-sm">
            Date:{" "}
            {new Date(game.cheapestPriceEver.date * 1000).toLocaleDateString()}
          </Text>
        </View>

        {/* Available Deals */}
        <View className="bg-[#1e1e1e] rounded-lg p-4 mt-6">
          <Text className="text-lg text-white font-rubik-medium mb-2">
            Available Deals
          </Text>
          {game.deals.map((deal, index) => (
            <View
              key={deal.dealID}
              className={`p-3 rounded-lg ${
                index % 2 === 0 ? "bg-[#2a2a2a]" : "bg-[#343434]"
              } mb-2`}
            >
              {stores[deal.storeID] && (
                <View className="flex flex-row items-center mb-3">
                  <Image
                    source={{
                      uri: `https://www.cheapshark.com${
                        stores[deal.storeID].images.logo
                      }`,
                    }}
                    className="w-10 h-10 rounded-full"
                  />
                  <Text className="text-green-300 text-base ml-3">
                    {stores[deal.storeID].storeName}
                  </Text>
                </View>
              )}
              <Text className="text-white text-base">
                Price: {deal.price == "0.00" ? "Free" : `$${deal.price}`}{" "}
                (Retail Price: ${deal.retailPrice})
              </Text>
              <Text className="text-yellow-400 text-base">
                Savings: {parseFloat(deal.savings).toFixed(2)}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Property;
