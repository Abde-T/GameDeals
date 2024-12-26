import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";

import { useAppwrite } from "@/lib/useAppwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { getDeals, getFeaturedDeals, getLatestProperties, getProperties } from "@/lib/appwrite";
import NoResults from "@/components/NoResults";
import Filters from "@/components/Filters";
import { Card, FeaturedCard } from "@/components/cards";
import Search from "@/components/Search";

const Home = () => {
  const { user } = useGlobalContext();

  const params = useLocalSearchParams<{ query?: string; filter?: string }>();

  const { data: latestProperties, loading: latestPropertiesLoading } =
    useAppwrite({
      fn: getLatestProperties,
    });

  const {
    data: properties,
    refetch,
    loading,
  } = useAppwrite({
    fn: getProperties,
    params: {
      filter: params.filter!,
      query: params.query!,
      limit: 6,
    },
    skip: true,
  });

  const [deals, setDeals] = useState([]);
  const [isLoaded, setLoading] = useState(true);

  useEffect(() => {
    const loadDeals = async () => {
      const deals = await getFeaturedDeals(20); // Await the promise
      setDeals(deals);
      setLoading(loading);
    };

    loadDeals();
  }, []);

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 6,
    });
  }, [params.filter, params.query]);

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

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

  const filteredDeals = applyFilter(deals);

  return (
    <SafeAreaView className="h-full bg-[#242424]">
      <FlatList
        data={filteredDeals}
        numColumns={2}
        renderItem={({ item }) => (
          <Card item={item} onPress={() => handleCardPress(item.gameID)} />
        )}
        keyExtractor={(item) => item.dealID}
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
              <View className="flex flex-row">
                <Image
                  source={{ uri: user?.avatar }}
                  className="size-12 rounded-full"
                />

                <View className="flex flex-col items-start ml-2 justify-center">
                  <Text className="text-xs font-rubik text-green-100">
                    Good Morning
                  </Text>
                  <Text className="text-base font-rubik-medium text-white">
                    {user?.name}
                  </Text>
                </View>
              </View>
              <Image source={icons.bell} className="size-6"  tintColor="#86EFAC"/>
            </View>

            <Search />

            <View className="my-5">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold text-green-300">
                  Featured
                </Text>
                <TouchableOpacity>
                  <Text className="text-base font-rubik-bold text-green-500">
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              {latestPropertiesLoading ? (
                <ActivityIndicator size="large" className="text-green-300" />
              ) : !latestProperties || latestProperties.length === 0 ? (
                <NoResults />
              ) : (
                <FlatList
                  data={deals}
                  renderItem={({ item }) => (
                    <FeaturedCard
                      item={item}
                      onPress={() => handleCardPress(item.gameID )}
                    />
                  )}
                  keyExtractor={(item) => item.dealID}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="flex gap-5 mt-5"
                />
              )}
            </View>

            {/* <Button title="seed" onPress={seed} /> */}

            <View className="mt-5">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold text-green-300">
                  Our Recommendation
                </Text>
                <TouchableOpacity>
                  <Text className="text-base font-rubik-bold text-green-500">
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              <Filters />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Home;
