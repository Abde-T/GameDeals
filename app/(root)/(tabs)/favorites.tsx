import images from "@/constants/images";
import { fetchFavoriteGames } from "@/lib/appwrite";
import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FavoriteGame {
  $id: string;
  title: string;
  thumb: string;
}
const favorites = () => {
  const [favoriteGames, setFavoriteGames] = useState<FavoriteGame[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const games = await fetchFavoriteGames();
      setFavoriteGames(games);
    };

    loadFavorites();
  }, []);

  return (
    <SafeAreaView className="h-full bg-[#242424]">
      <ScrollView className="p-5">
        <Text className="text-xl font-rubik-bold text-green-300 mb-4">
          Favorite Games
        </Text>
        {favoriteGames.length === 0 ? (
          <Text className="text-lg text-white">No favorites found!</Text>
        ) : (
          favoriteGames.map((game) => (
            <View
              key={game.$id}
              className="w-full h-40 flex flex-col items-center justify-between mb-4 border rounded-lg border-green-300 "
            >
              <Image
                source={{ uri: game.thumb }}
                className="w-full h-40 rounded-2xl "
              />
              <Image
                source={images.cardGradient}
                className="size-full rounded-xl absolute -bottom-0.5"
              />

              <Text className="absolute left-1 bottom-5 text-lg text-white ml-4 text-left w-full">
                {game.title}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default favorites;
