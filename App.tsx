import { StatusBar } from 'expo-status-bar';
import { Component, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';

const Type: React.FunctionComponent<{types: string[], updateSelectedType: Function}> = ({types, updateSelectedType}) => {
  const [typeList, setTypeList] = useState([] as string[]);
  const btnList = types.map(item => {
    return <TypeButton key={item} title={item} addType={(name: string) => {setTypeList([...typeList, name]); updateSelectedType([...typeList, name])}} removeType={(name: string) => {
      const tempList: string[] = [];
      typeList.forEach(item => {
        if (item !== name) {
          tempList.push(item);
        }
      });
      setTypeList(tempList);
      updateSelectedType(tempList);
    }} />;
  });
  return (
    <View style={styles.flexContainer}>
      <Text style={styles.boldFont}>
        Types:
      </Text>
      <View style={styles.flexContainer}>
        {btnList}
      </View>
    </View>
  );
};

const TypeButton: React.FunctionComponent<{title: string, addType: Function, removeType: Function}> = ({title, addType, removeType}) => {
  let [selected, setSelected] = useState(false);
  return (
    <TouchableOpacity
      style={selected ? styles.buttonSelectStyle : styles.buttonStyle}
      onPress={() => {
        setSelected(!selected);
        if (selected) {
          removeType(title);
        } else {
          addType(title);
        }
      }}
    >
      <Text style={selected ? styles.buttonSelectText : styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const Result: React.FunctionComponent<{resultList: any[]}> = ({resultList}) => {
  let [pager, setPager] = useState(1);
  const maxPage = Math.ceil(resultList.length / 48);
  let [prevDisable, setPrevDisable] = useState(true);
  let [nextDisable, setNextDisable] = useState(false);
  return (
    <View>
      <Text style={styles.boldFont}>{resultList.length} results found</Text>
      <FlatList
        data={resultList.slice((pager - 1) * 48, pager * 48 > resultList.length ? resultList.length : pager * 48)}
        renderItem={({item}) => {
          return <ResultItem result={item} />;
        }}
        numColumns={4}
      />
      <View style={styles.navigatorCss}>
        <TouchableOpacity style={prevDisable ? styles.buttonDisable : styles.buttonSelectStyle}
          onPress={() => {
            if (!prevDisable) {
              const currentPage = pager - 1;
              setPager(currentPage);
              // setShowList(resultList.slice((currentPage - 1) * 48, currentPage * 48));
              setPrevDisable(currentPage === 1);
              setNextDisable(false);
            }
          }}>
          <Text style={styles.buttonSelectText}>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity style={nextDisable ? styles.buttonDisable : styles.buttonSelectStyle}
          onPress={() => {
            if (!nextDisable) {
              const currentPage = pager + 1;
              setPager(currentPage);
              // setShowList(resultList.slice((currentPage - 1) * 48, currentPage * 48 > resultList.length ? (resultList.length - 1) : currentPage * 48));
              setNextDisable(currentPage === maxPage);
              setPrevDisable(false);
            }
          }}>
          <Text style={styles.buttonSelectText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ResultItem: React.FunctionComponent<{result: any}> = ({result}) => {
  const [imgUrl, setImgUrl] = useState(() => {
    axios.get(result.url).then(res => {
      const sprites = res.data.sprites;
      setImgUrl(sprites.other['official-artwork'].front_default);
    });
    return '';
  });
  useEffect(() => {
    axios.get(result.url).then(res => {
      const sprites = res.data.sprites;
      setImgUrl(sprites.other['official-artwork'].front_default);
    });
  }, [result]);
  return (
    <View style={styles.container}>
      <View style={{alignItems: 'center'}}>
        <Image
          style={{width: 100, height: 100}}
          source={{uri: imgUrl}}
        />
      </View>
      <Text style={{textAlign: 'center'}}>{result.name}</Text>
    </View>
  );
};

class Main extends Component {
  state: any = {
    totalResultList: [],
    typeList: [],
    resultList: [],
    filterTypes: [] as string[],
    typeInfo: new Map()
  };
  componentDidMount(): void {
    axios.get('https://pokeapi.co/api/v2/type').then((res: { data: any; }) => {
      this.setState({ typeList: res.data.results});
      res.data.results.forEach((item: { url: string; name: any; }) => {
        axios.get(item.url).then(res => {
          this.state.typeInfo.set(item.name, res.data.pokemon);
        });
      })
    });
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=1200').then(res => {
      this.setState({ resultList: res.data.results, totalResultList: res.data.results });
    });
  }
  render() {
    return (
    <View style={styles.container}>
      <Type types={this.state.typeList.map((item: { name: string; }) => item.name)} updateSelectedType={(types: string[]) => {
        this.setState({ filterTypes: types });
        if (types.length === 0) {
          this.setState({
            resultList: this.state.totalResultList
          });
        } else if (types.length === 1) {
          this.setState({
            resultList: this.state.typeInfo.get(types[0]).map((item: { pokemon: any; }) => item.pokemon)
          });
        } else {
          const firstArr = this.state.typeInfo.get(types[0]);
          const tempList = [] as any[];
          firstArr.forEach((item: { pokemon: { name: string; }; }) => {
            const name = item.pokemon.name;
            let contain = false;
            for (let i = 1; i < types.length; i++) {
              const list = this.state.typeInfo.get(types[i]);
              if (list.some((item: { pokemon: { name: string; }; }) => item.pokemon.name === name)) {
                contain = true;
              } else {
                contain = false;
                break;
              }
            }
            if (contain) {
              tempList.push(item);
            }
          });
          this.setState({
            resultList: tempList.map(item => item.pokemon)
          });
        }
      }} />
      <Result resultList={this.state.resultList} />
      <StatusBar style="auto" />
      {/* <View style={{position: 'absolute', width: '100%', height: '100%', top: 0, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator></ActivityIndicator>
      </View> */}
    </View>
  )};
};

export default function App() {
  return <Main></Main>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center',
  },
  flexContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1
  },
  boldFont: {
    fontWeight: '700',
    marginTop: '1rem',
    marginBottom: '1rem',
    marginRight: '0.5rem'
  },
  buttonStyle: {
    padding: '0.5rem',
    margin: '0.5rem',
    borderRadius: 2,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: 'rgb(127,29,29)'
  },
  buttonText: {
    color: 'rgb(127, 29, 29)',
    fontSize: 16,
    fontWeight: '700'
  },
  buttonSelectStyle: {
    padding: '0.5rem',
    margin: '0.5rem',
    borderRadius: 2,
    backgroundColor: 'rgb(127,29,29)',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: 'rgb(127,29,29)'
  },
  buttonSelectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  navigatorCss: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  buttonDisable: {
    opacity: 0.4,
    padding: '0.5rem',
    margin: '0.5rem',
    borderRadius: 2,
    backgroundColor: 'rgb(127,29,29)',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: 'rgb(127,29,29)'
  }
});

