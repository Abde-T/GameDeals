import icons from "@/constants/icons";
import images from "@/constants/images";
import { getStoreById } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Models } from "react-native-appwrite";

interface Props {
  item: Models.Document;
  onPress?: () => void;
}

const useStoreById = (storeID: string) => {
  const [store, setStore] = useState<any>(null); // State to hold store info
  const [loading, setLoading] = useState<boolean>(true); // State to track loading

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const storeData = await getStoreById(storeID);
        setStore(storeData); // Update state with store info
        setLoading(false); // Set loading to false once the data is fetched
      } catch (error) {
        console.error("Error fetching store:", error);
        setLoading(false); // Set loading to false if there was an error
      }
    };

    fetchStore();
  }, [storeID]); // Re-run effect if storeID changes

  return { store, loading };
};

export const FeaturedCard = ({ item, onPress }: Props) => {
  const { store, loading } = useStoreById(item.storeID); // Use the custom hook

  if (loading) {
    return <Text>Loading store data...</Text>; // Show a loading message while store data is being fetched
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col items-start w-[25rem] h-52 relative"
    >
      <Image source={{ uri: item.thumb }} className="size-full rounded-2xl" />

      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      />

      <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5">
        <Image source={icons.star} className="size-3.5" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
          {item.dealRating}
        </Text>
      </View>

      <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
        <Text
          className="text-xl font-rubik-extrabold text-white"
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <View className="flex flex-row items-center justify-between w-full">
          <View className=" flex flex-col justify-center items-left">
            <Text className="text-xs font-rubik mb-2 text-white">
              {store.storeName}
            </Text>
            <Image
              source={{
                uri: `https://www.cheapshark.com${store.images.icon}`,
              }}
              className="w-6 h-6 mr-6"
            />
          </View>
          <View>
            <Text className="text-base font-rubik text-yellow-400 line-through">
              ${item.normalPrice}
            </Text>
            <Text className="text-xl font-rubik-extrabold text-green-300">
              {item.salePrice == "0.00" ? "Free" : `$${item.salePrice}`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const Card = ({ item, onPress }: Props) => {
  const { store, loading } = useStoreById(item.storeID); // Use the custom hook

  if (loading) {
    return <Text>Loading store data...</Text>; // Show a loading message while store data is being fetched
  }

  return (
    <TouchableOpacity
      className="flex-1 flex-col items-center justify-between w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
      onPress={onPress}
    >
      <View className="flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50">
        <Image source={icons.star} className="size-2.5" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-0.5">
          {item.dealRating}
        </Text>
      </View>
      <View className="w-full">
        <Image
          source={{ uri: item.thumb }}
          className="w-full h-40 rounded-lg"
        />
        <View className="flex flex-col w-full mt-2">
          <Text
            className="text-base font-rubik-bold text-black-300"
            numberOfLines={1}
          >
            {item.title}
          </Text>
        </View>
      </View>
      <View className=" w-full">
       
        <View className=" w-full flex flex-row items-center justify-between mt-2">
          <View className=" flex flex-col">
            <Image
              source={{
                uri: `https://www.cheapshark.com${store.images.icon}`,
              }}
              className="w-6 h-6 mr-6"
            />
            <Text className="text-xs mt-2 font-rubik text-black-100  ">
              {store.storeName}
            </Text>
          </View>
          <View className=" flex flex-col">
            <Text className="text-base text-right font-rubik text-yellow-400 line-through decoration-4 decoration-blue-500">
              ${item.normalPrice}
            </Text>
            <Text className="text-base font-rubik-bold text-green-500 text-right">
              {item.salePrice == "0.00" ? "Free" : `$${item.salePrice}`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ExploreCard = ({ item, onPress }: Props) => {
  const { store, loading } = useStoreById(item.storeID); // Use the custom hook

  if (loading) {
    return <Text>Loading store data...</Text>; // Show a loading message while store data is being fetched
  }

  return (
    <TouchableOpacity
      className="flex-1 flex-col items-center justify-between w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
      onPress={onPress}
    >
      <View className="w-full">
        <Image
          source={{ uri: item.thumb }}
          className="w-full h-40 rounded-lg"
        />
        <View className="flex flex-col w-full mt-2">
          <Text
            className="text-base font-rubik-bold text-black-300"
            numberOfLines={1}
          >
            {item.external}
          </Text>
        </View>
      </View>
      <View className=" w-full">
        <View className=" w-full flex flex-row items-center justify-between mt-2">
          <Text className="text-base font-rubik-bold text-green-500 text-right">
            {item.cheapest == "0.00" ? "Free" : `$${item.cheapest}`}
          </Text>
          
        </View>
      </View>
    </TouchableOpacity>
  );
};
