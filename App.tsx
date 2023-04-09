import { StatusBar } from 'expo-status-bar';
import { Component, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TYPE, mockData } from './mockData';
import axios from 'axios';

const Type: React.FunctionComponent<{types: string[]}> = ({types}) => {
  const btnList = types.map(item => {
    return <TypeButton key={item} title={item} />;
  });
  return (
    <View style={styles.flexContainer}>
      <Text style={styles.boldFont}>
        Types:
      </Text>
      <View style={styles.flexContainer}>
        {btnList}
      </View>
      {/* <FlatList
        data={types}
        renderItem={({item}) => {
          return <TypeButton title={item} />;
        }}
        horizontal={true}
      /> */}
    </View>
  );
};

const TypeButton: React.FunctionComponent<{title: string}> = ({title}) => {
  let [selected, setSelected] = useState(false);
  return (
    <TouchableOpacity
      style={selected ? styles.buttonSelectStyle : styles.buttonStyle}
      onPress={() => setSelected(!selected)}
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
        data={resultList.slice((pager - 1) * 48, pager * 48 > resultList.length ? (resultList.length - 1) : pager * 48)}
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
  return (
    <View style={styles.container}>
      <View>
        <Image
          style={{width: 50, height: 50}}
          source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}
        />
      </View>
      <Text>{result.name}</Text>
    </View>
  );
};

class Main extends Component {
  state: any = {
    typeList: [],
    resultList: []
  };
  componentDidMount(): void {
    axios.get('https://pokeapi.co/api/v2/type').then((res: { data: any; }) => {
      this.setState({ typeList: res.data.results.map((item: { name: string; }) => item.name)});
    });
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=1200').then(res => {
    this.setState({ resultList: res.data.results });
    });
  }
  render() {
    return (
    <View style={styles.container}>
      <Type types={this.state.typeList} />
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

