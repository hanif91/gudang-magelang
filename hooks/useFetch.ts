import useSWR from 'swr';
import AxiosClient from "@/lib/AxiosClient";

const fetcher = (url: any) => AxiosClient.get(url).then(res => res.data)


export default function useFetch(url: any, params: any = {}) {
  // if values in params is null, undefined, or empty string, remove it
  const filteredParams = Object.keys(params).reduce((acc: any, key: any) => {
    if (
      params[key] !== null &&
      params[key] !== undefined &&
      params[key] !== '' &&
      params[key] !== 'undefined' &&
      params[key] !== 'null'
    ) {
      acc[key] = params[key];
    }
    return acc;
  }, {});
  const string_params = new URLSearchParams(filteredParams).toString();
  const req_url = string_params ? `${url}?${string_params}` : url;
  const { data, error, isLoading, mutate } = useSWR(req_url, () => fetcher(req_url), {
    revalidateOnFocus: false,
  });

  return {
    data: data ?? [],
    isLoading,
    error,
    mutate,
  };
}