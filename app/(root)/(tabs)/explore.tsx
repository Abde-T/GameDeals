import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import icons from "@/constants/icons";
import Search from "@/components/Search";
import { Card, ExploreCard } from "@/components/cards";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";

import { getFeaturedDeals, getGames, getProperties } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";

const Explore = () => {
  const params = useLocalSearchParams<{ query?: string; filter?: string }>();

  const {
    data: properties,
    refetch,
    loading,
  } = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter!,
      query: params.query!,
    },
    skip: true,
  });

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
    });
  }, [params.filter, params.query]);

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  const [deals, setDeals] = useState([]);
  const [isLoaded, setLoading] = useState(true);
  const [games, setGames] = useState([]);

  useEffect(() => {
    const loadDeals = async () => {
      const deals = await getFeaturedDeals(100); // Await the promise
      setDeals(deals);
      setLoading(loading);
    };

    loadDeals();
  }, []);

  // Load Games when `params.query` changes
  useEffect(() => {
    if (!params.query) {
      setGames([]); // Clear games if no query is provided
      return;
    }

    const loadGames = async () => {
      try {
        setLoading(true);
        const games = await getGames(params.query); // Await the promise
        setGames(games); // Correctly update the `games` state
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, [params.query]); // Trigger when `params.query` changes
  

  const applyFilter = (items: any[]) => {
    const filter = params.filter;
    if (!filter || filter === "All") return items;

    return items.filter((item) => {
      switch (filter) {
        case "100Discount":
          return item.savings === '100.000000';
        case "50Discount":
          return item.savings === '50.000000';
        case "< $5":
          return item.salePrice < 5;
        case "< $10":
          return item.salePrice < 10;
        case "< $20":
          return item.salePrice < 20;
        default:
          return true;
      }
    });
  };

  const filteredGames = applyFilter(games);
  const filteredDeals = applyFilter(deals);

  return (
    <SafeAreaView className="h-full bg-[#242424]">
      <FlatList
        data={filteredGames.length == 0 ? filteredDeals : filteredGames}
        numColumns={2}
        renderItem={({ item }) =>
          filteredGames.length === 0 ? (
            <Card item={item} onPress={() => handleCardPress(item.gameID)} />
          ) : (
            <ExploreCard
              item={item}
              onPress={() => handleCardPress(item.gameID)}
            />
          )
        }
        keyExtractor={(item, index) =>
          index.dealID || index.toString()
        }
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-green-300 mt-5" />
          ) : (
            <NoResults />
          )
        }
        ListHeaderComponent={() => (
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
              >
                <Image source={icons.backArrow} className="size-5" />
              </TouchableOpacity>

              <Text className="text-base mr-2 text-center font-rubik-medium text-green-300">
                Search for Your Ideal Home
              </Text>
              <Image source={icons.bell} className="w-6 h-6" />
            </View>

            <Search />

            <View className="mt-5">
              <Filters />

              <Text className="text-xl font-rubik-bold text-green-300 mt-5">
                Found {filteredGames?.length === 0 ? filteredDeals?.length : filteredGames?.length}{" "}
                Games
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Explore;
